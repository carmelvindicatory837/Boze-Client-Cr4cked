#version 330 core

out vec4 color;

in vec2 v_TexturePosition;
in vec2 v_TexelSize;

uniform sampler2D u_Texture;    // chams FB color
uniform sampler2D u_Depth;      // chams FB depth
uniform sampler2D u_WorldDepth; // main FB depth

void main() {
    vec4 entityColor = texture(u_Texture, v_TexturePosition);

    // Discard transparent pixels (no entity rendered here)
    if (entityColor.a < 0.01) discard;

    float entityDepth = texture(u_Depth, v_TexturePosition).r;
    float worldDepth = texture(u_WorldDepth, v_TexturePosition).r;

    // Only show entity pixels that are behind world geometry
    // (entity would have failed the vanilla LEQUAL depth test)
    if (entityDepth <= worldDepth) discard;

    color = entityColor;
}
