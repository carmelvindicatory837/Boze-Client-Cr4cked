#version 330 core

out vec4 color;

in vec2 v_TexturePosition;
in vec2 v_TexelSize;

uniform sampler2D u_Texture;
uniform sampler2D u_Mask;

void main() {
    vec4 texColor = texture(u_Texture, v_TexturePosition);
    vec4 maskColor = texture(u_Mask, v_TexturePosition);

    // Only copy where mask.a != 0
    if (maskColor.a != 0.0) {
        color = clamp(texColor * 1.5, 0, 1);
    } else {
        discard;
    }
}
