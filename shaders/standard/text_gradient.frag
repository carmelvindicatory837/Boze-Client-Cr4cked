#version 330 core

#define PI 3.1415926535897932384626433832795

out vec4 color;

uniform sampler2D u_FontTexture;
uniform sampler2D u_Texture;

in vec2 v_FontTexCoord;
in vec2 v_TexturePosition;
in vec4 v_Color;

void main() {
    float angle = (v_Color.g - 0.5) * 2.0 * PI;

    float cosG = cos(angle - PI);
    float sinG = sin(angle);

    float aCosG = acos(cosG);
    float aSinG = asin(sinG);

    float cG = (aCosG / PI) * 2 - 1;
    float sG = (aSinG / PI) * 2;

    float xB = step(0.25, v_Color.g) * step(v_Color.g, 0.75);
    float yB = step(0.5, v_Color.g);

    float xG = (xB - v_TexturePosition.x) * cG;
    float yG = (yB - v_TexturePosition.y) * sG;

    vec3 c = texture(u_Texture, vec2((xG + yG), v_Color.r)).rgb;

    float alpha = texture(u_FontTexture, v_FontTexCoord).r;
    color = vec4(c * v_Color.b, alpha * v_Color.a);
}


