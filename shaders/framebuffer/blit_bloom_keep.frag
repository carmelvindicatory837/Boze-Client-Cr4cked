#version 330 core

out vec4 color;

in vec2 v_TexturePosition;
in vec2 v_TexelSize;

uniform sampler2D u_Texture;
uniform sampler2D u_Mask;

layout (std140) uniform BloomUBO {
    float u_Opacity;
};

void main() {
    vec4 texColor = texture(u_Texture, v_TexturePosition);
    float maskAlpha = texture(u_Mask, v_TexturePosition).a;

    // Soft inverse mask with opacity control:
    // maskAlpha=1 (solid text) -> bloom contribution = 0
    // maskAlpha=0 (no text)   -> bloom contribution = full * opacity
    // Smooth transition at anti-aliased glyph edges.
    color = clamp(texColor * 1.5, 0, 1) * (1.0 - maskAlpha) * u_Opacity;
}
