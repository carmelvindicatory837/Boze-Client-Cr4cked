#version 330 core

out vec4 color;

in vec2 v_TexturePosition;
in vec2 v_TexelSize;

uniform sampler2D u_Texture;
uniform sampler2D u_Mask;

void main() {
    vec4 texColor = texture(u_Texture, v_TexturePosition);
    float maskAlpha = texture(u_Mask, v_TexturePosition).a;

    // Soft inverse mask: smoothly fade out bloom where original text exists.
    // maskAlpha=1 (solid text) -> bloom contribution = 0
    // maskAlpha=0 (no text)   -> bloom contribution = full
    // Smooth transition at anti-aliased glyph edges.
    color = clamp(texColor * 1.5, 0, 1) * (1.0 - maskAlpha);
}
