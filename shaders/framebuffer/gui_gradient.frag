#version 330 core

#define PI 3.1415926535897932384626433832795

in vec2 v_TexturePosition;
in vec2 v_TexelSize;

uniform sampler2D u_Texture;
uniform sampler2D u_Gradient;

layout (std140) uniform GuiUBO {
    int fastRender;
    float opacity;
    int outRadius;
    float glow;
    vec4 outlineColor;
};

out vec4 color;

void main() {
    vec4 c = texture(u_Texture, v_TexturePosition);

    if (c.a > 0.0) {
        discard;
    } else {
        float bestDist2 = float(outRadius * outRadius + 1);

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
                    if (d2 < bestDist2) { bestDist2 = d2; }
                }
            }
        }

        float limit = float(outRadius * outRadius);
        float d = clamp(bestDist2 / limit, 0.0, 1.0);

        float angle = (outlineColor.g - 0.5) * 2.0 * PI;
        float cosG = cos(angle - PI);
        float sinG = sin(angle);
        float aCosG = acos(cosG);
        float aSinG = asin(sinG);
        float cG = (aCosG / PI) * 2 - 1;
        float sG = (aSinG / PI) * 2;
        float xB = step(0.25, outlineColor.g) * step(outlineColor.g, 0.75);
        float yB = step(0.5, outlineColor.g);
        float xG = (xB - v_TexturePosition.x) * cG;
        float yG = (yB - v_TexturePosition.y) * sG;

        vec3 gradientColor = texture(u_Gradient, vec2((xG + yG), outlineColor.r)).rgb;

        c = vec4(gradientColor, outlineColor.a * (1.0 - pow(d, glow)));
    }

    color = vec4(c.rgb, c.a * opacity);
}
