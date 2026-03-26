#version 330 core

#define PI 3.1415926535897932384626433832795

out vec4 color;

uniform sampler2D u_Texture;      // Text texture (with encoded gradient data)
uniform sampler2D u_Gradient;     // Gradient texture

in vec2 v_TexturePosition;

// Convert RGB to HSV
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// Convert HSV to RGB
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec4 src = texture(u_Texture, v_TexturePosition);
    
    // If no opacity, discard
    if (src.a == 0.0) {
        discard;
    }

    float angle = (src.g - 0.5) * 2.0 * PI;

    float cosG = cos(angle - PI);
    float sinG = sin(angle);

    float aCosG = acos(cosG);
    float aSinG = asin(sinG);

    float cG = (aCosG / PI) * 2 - 1;
    float sG = (aSinG / PI) * 2;

    float xB = step(0.25, src.g) * step(src.g, 0.75);
    float yB = step(0.5, src.g);

    float xG = (xB - v_TexturePosition.x) * cG;
    float yG = (yB - v_TexturePosition.y) * sG;

    vec3 c = texture(u_Gradient, vec2((xG + yG), src.r)).rgb;

    // Apply saturation modification
    vec3 hsv = rgb2hsv(c);
    hsv.y *= src.b; // Modify saturation based on src.bw
    c = hsv2rgb(hsv);
    
    // Output with original alpha
    color = vec4(c, src.a);
}
