#version 330 core

layout (location = 0) in vec2 Position;

layout (std140) uniform SizeUBO {
    vec2 u_Size;
};

out vec2 v_TexturePosition;
out vec2 v_TexelSize;

void main() {
    v_TexturePosition = (Position.xy + 1.0) / 2.0;
    v_TexelSize = 1.0 / u_Size;

    gl_Position = vec4(Position + v_TexelSize * 0.5, 0.0, 1.0);
}
