#version 330 core

out vec4 color;

in vec2 v_TexturePosition;
in vec2 v_TexelSize;

uniform sampler2D u_Texture;
uniform sampler2D u_Previous;

layout (std140) uniform MotionBlurUBO {
    float u_BlendFactor;
};

void main() {
    vec4 current = texture(u_Texture, v_TexturePosition);
    vec4 previous = texture(u_Previous, v_TexturePosition);
    color = mix(previous, current, u_BlendFactor);
}
