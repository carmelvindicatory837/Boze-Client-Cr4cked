#version 330 core

layout (location = 0) in vec4 Position;
layout (location = 1) in vec4 Color;

layout (std140) uniform TransformUBO {
    mat4 u_Projection;
    mat4 u_ModelView;
};

out vec2 v_TexturePosition;
out vec4 v_Color;

void main() {
    gl_Position = u_Projection * u_ModelView * Position;

    v_TexturePosition = (gl_Position.xy + 1.0) / 2.0;
    v_Color = Color;
}
