#version 330 core

// try lowp

in vec2 v_TexturePosition;
in vec2 v_TexelSize;

uniform sampler2D u_Texture;

out vec4 color;

layout (std140) uniform DualFilterUBO {
    float u_Spread;
};

void main() {
    // https://community.arm.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-20-66/siggraph2015_2D00_mmg_2D00_marius_2D00_notes.pdf
    vec2 halfpixel = v_TexelSize * 0.5;
    vec4 sum = texture(u_Texture, v_TexturePosition) * 8;
    sum += texture(u_Texture, v_TexturePosition - halfpixel.xy * u_Spread);
    sum += texture(u_Texture, v_TexturePosition + halfpixel.xy * u_Spread);
    sum += texture(u_Texture, v_TexturePosition + vec2(halfpixel.x, -halfpixel.y) * u_Spread);
    sum += texture(u_Texture, v_TexturePosition - vec2(halfpixel.x, -halfpixel.y) * u_Spread);
    color = sum / 12.0;
}
