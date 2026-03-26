#version 330 core

out vec4 color;

in vec2 v_TexturePosition;
in vec2 v_TexelSize;

uniform sampler2D u_Mask;
uniform sampler2D u_GlintTexture;

layout (std140) uniform GlintUBO {
    float u_ScrollX;
    float u_ScrollY;
    float u_Scale;
};

void main() {
    float mask = texture(u_Mask, v_TexturePosition).a;
    if (mask == 0.0) discard;

    // Correct for aspect ratio so glint pattern is not stretched
    float aspectRatio = v_TexelSize.y / v_TexelSize.x;
    vec2 uv = v_TexturePosition;
    uv.x *= aspectRatio;

    // Scale UV for texture tiling density
    uv *= u_Scale;

    // Rotate by PI/18 (10 degrees) - same as vanilla enchantment glint
    const float cosA = 0.98480775;
    const float sinA = 0.17364818;
    uv = vec2(uv.x * cosA - uv.y * sinA, uv.x * sinA + uv.y * cosA);

    // Scroll
    uv += vec2(-u_ScrollX, u_ScrollY);

    vec4 glintColor = texture(u_GlintTexture, uv);
    color = glintColor * mask;
}
