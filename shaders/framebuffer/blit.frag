#version 330 core

out vec4 color;

in vec2 v_TexturePosition;
in vec2 v_TexelSize;

uniform sampler2D u_Texture;

void main() {
    color = clamp(texture(u_Texture, v_TexturePosition) * 1.5, 0, 1);
}
