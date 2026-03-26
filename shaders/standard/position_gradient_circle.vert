#version 330 core

layout (location = 0) in vec2 Position;
layout (location = 1) in vec4 Color;
layout (location = 2) in vec2 Center;
layout (location = 3) in vec4 CircleParams;

layout (std140) uniform TransformUBO {
    mat4 u_Projection;
    mat4 u_ModelView;
};

out vec2 v_TexturePosition;
out vec4 v_Color;
out vec4 v_Position;
out vec4 v_Center;
out float v_Smoothing;
out float v_MaxRadius;
out float v_MinAngle;
out float v_MaxAngle;

void main() {
    gl_Position = u_Projection * u_ModelView * vec4(Position, 0.0, 1.0);

    v_TexturePosition = (gl_Position.xy + 1.0) / 2.0;
    v_Color = Color;
    v_Position = vec4(Position, 0.0, 1.0);
    v_Center = vec4(Center, 0.0, 1.0);
    v_Smoothing = CircleParams.x;
    v_MaxRadius = CircleParams.y;
    v_MinAngle = CircleParams.z;
    v_MaxAngle = CircleParams.w;
}
