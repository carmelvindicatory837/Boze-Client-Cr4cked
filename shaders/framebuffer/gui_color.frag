#version 330 core

in vec2 v_TexturePosition;
in vec2 v_TexelSize;

uniform sampler2D u_Texture;

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

    if (c.a != 0.0) {
        discard;
    } else {
        float bestDist2 = float(outRadius * outRadius + 1);

        // Simple fastRender-style coarse check: sample a grid with step = outRadius/fastRender
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
            if (!present) {
                discard;
            }
        }

        // Full square scan to find nearest non-transparent pixel (distance outward)
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
        c = outlineColor;
        c.a *= (1.0 - pow(d, glow));
    }

    color = vec4(c.rgb, c.a * opacity);
}
