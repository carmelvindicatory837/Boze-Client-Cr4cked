#version 330 core

#define PI 3.1415926535897932384626433832795

in vec2 v_TexturePosition;
in vec2 v_TexelSize;

uniform sampler2D u_Texture;
uniform sampler2D u_Image;
uniform sampler2D u_Gradient;

layout (std140) uniform EspUBO {
    int fastRender;
    int inRadius;
    int outRadius;
    float glow;
    float outlineOpacity;
    float fillOpacity;
    float imageOpacity;
};

out vec4 color;

void main() {
    vec4 c = texture(u_Texture, v_TexturePosition);

    if (c.a != 0.0) {
        float angle = (c.g - 0.5) * 2.0 * PI;

        float cosG = cos(angle - PI);
        float sinG = sin(angle);

        float aCosG = acos(cosG);
        float aSinG = asin(sinG);

        float cG = (aCosG / PI) * 2 - 1;
        float sG = (aSinG / PI) * 2;

        float xB = step(0.25, c.g) * step(c.g, 0.75);
        float yB = step(0.5, c.g);

        float xG = (xB - v_TexturePosition.x) * cG;
        float yG = (yB - v_TexturePosition.y) * sG;

        vec3 gradientColor = texture(u_Gradient, vec2((xG + yG), c.r)).rgb;

        c = vec4(gradientColor, c.b);

        // Preserve original glyph color+alpha for outline before we touch fillOpacity.
        vec4 base = c;

        // --- Fill layer: glyph (scaled by fillOpacity) under image texture ---
        vec4 glyphFill = c;
        glyphFill.a *= fillOpacity;          // fill-only opacity

        vec4 i = texture(u_Image, v_TexturePosition);
        i.a = imageOpacity;                  // image-only opacity

        // Composite image OVER glyphFill (standard "over")
        float fillAlpha = i.a + glyphFill.a * (1.0 - i.a);
        vec3  fillRGB   = (i.rgb * i.a + glyphFill.rgb * glyphFill.a * (1.0 - i.a)) / max(fillAlpha, 1e-6);

        // (Optional) If you want to additionally dim the *color* (not alpha) by fillOpacity, do it here.
        // vec3  fillRGBVis = fillRGB * fillOpacity;   // uncomment if you liked your old look
        // float fillAlphaVis = fillAlpha;             // don't double-multiply alpha unless intended
        // vec4 fillColor = vec4(fillRGBVis, fillAlphaVis);

        vec4 fillColor = vec4(fillRGB, fillAlpha);    // recommended: no second alpha multiply


        // --- Outline layer (computed from *base*, i.e., pre-fillOpacity glyph) ---
        vec4 outlineColor = vec4(0.0);
        if (inRadius > 0) {
            float bestDist2 = float(inRadius * inRadius + 1.0);
            int r = inRadius;

            // Simple fastRender-style coarse check with step = r/fastRender (endpoint snapped)
            if (fastRender > 0 && r > 3) {
                int step = max(r / max(fastRender, 1), 1);
                bool present = false;
                for (int x = -r; x <= r; ) {
                    for (int y = -r; y <= r; ) {
                        vec4 sEdge = texture(u_Texture, v_TexturePosition + v_TexelSize * vec2(x, y));
                        if (sEdge.a == 0.0) { present = true; break; }
                        int nextY = y + step;
                        y = (nextY > r && y != r) ? r : nextY;
                    }
                    if (present) break;
                    int nextX = x + step;
                    x = (nextX > r && x != r) ? r : nextX;
                }
                if (!present) {
                    c = fillColor;
                    color = c;
                    return;
                }
            }

            // Full square scan inward: nearest transparent pixel distance
            for (int x = -r; x <= r; ++x) {
                for (int y = -r; y <= r; ++y) {
                    vec4 sEdge = texture(u_Texture, v_TexturePosition + v_TexelSize * vec2(x, y));
                    if (sEdge.a == 0.0) {
                        float d2 = float(x * x + y * y);
                        if (d2 < bestDist2) bestDist2 = d2;
                    }
                }
            }

            float limit = float(r * r);
            if (bestDist2 <= limit) {
                float d = clamp(bestDist2 / limit, 0.0, 1.0);
                float oAlpha = base.a * outlineOpacity * (1.0 - pow(d, glow));
                outlineColor = vec4(base.rgb, oAlpha);
            }

            // Composite outline over fill
            float outAlpha = outlineColor.a + fillColor.a * (1.0 - outlineColor.a);
            vec3  outRGB   = (outlineColor.rgb * outlineColor.a +
            fillColor.rgb   * fillColor.a * (1.0 - outlineColor.a)) / max(outAlpha, 1e-6);
            c = vec4(outRGB, outAlpha);
        } else {
            c = fillColor; // No outline, just use the fill color.
        }
    } else {
        float bestDist2 = float(outRadius * outRadius + 1);
        vec4 bestC = vec4(0.0);

        // Simple fastRender-style coarse check: grid with step = outRadius/fastRender
        if (fastRender > 0 && outRadius > 3) {
            int step = max(outRadius / max(fastRender, 1), 1);
            bool present = false;
            for (int x = -outRadius; x <= outRadius; ) {
                for (int y = -outRadius; y <= outRadius; ) {
                    vec4 sEdge = texture(u_Texture, v_TexturePosition + v_TexelSize * vec2(x, y));
                    if (sEdge.a > 0.0) { present = true; break; }
                    int nextY = y + step;
                    y = (nextY > outRadius && y != outRadius) ? outRadius : nextY;
                }
                if (present) break;
                int nextX = x + step;
                x = (nextX > outRadius && x != outRadius) ? outRadius : nextX;
            }
            if (!present) discard;
        }

        // Full square scan outward: nearest non-transparent pixel
        for (int x = -outRadius; x <= outRadius; ++x) {
            for (int y = -outRadius; y <= outRadius; ++y) {
                vec4 sEdge = texture(u_Texture, v_TexturePosition + v_TexelSize * vec2(x, y));
                if (sEdge.a > 0.0) {
                    float d2 = float(x * x + y * y);
                    if (d2 < bestDist2) { bestDist2 = d2; bestC = sEdge; }
                }
            }
        }

        float limit = float(outRadius * outRadius);
        float d = clamp(bestDist2 / limit, 0.0, 1.0);
        c = bestC;

        float angle = (c.g - 0.5) * 2.0 * PI;

        float cosG = cos(angle - PI);
        float sinG = sin(angle);

        float aCosG = acos(cosG);
        float aSinG = asin(sinG);

        float cG = (aCosG / PI) * 2 - 1;
        float sG = (aSinG / PI) * 2;

        float xB = step(0.25, c.g) * step(c.g, 0.75);
        float yB = step(0.5, c.g);

        float xG = (xB - v_TexturePosition.x) * cG;
        float yG = (yB - v_TexturePosition.y) * sG;

        vec3 gradientColor = texture(u_Gradient, vec2((xG + yG), c.r)).rgb;

        c = vec4(gradientColor, outlineOpacity * (1.0 - pow(d, glow)) * c.b);
    }

    color = c;
}
