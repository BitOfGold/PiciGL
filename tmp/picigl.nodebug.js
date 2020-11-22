// PiciGL by @BitOfGold
var gl, program

// shorthand for a Float32Array
function f(n) { return new Float32Array(n) }

// initialize context
function gl_init(canvas) {
gl = canvas.getContext('webgl2')

//get extension
function _glge(name) {
let e = gl.getExtension(name)
return e
}

_glge('EXT_color_buffer_float')
_glge('EXT_float_blend')
gl._floatlinear = _glge('OES_texture_float_linear')
gl.clearColor(0, 0, 0, 1)
gl.enable(3042)
gl.blendFunc(1, 771)
gl.enable(2929)
gl.w = canvas.width
gl.h = canvas.height
}


// clear
function gl_clear(depth=true) {
gl.clear(16384 | 256)
}

// resize context
function gl_resize(w, h) {
gl.viewport(0, 0, w, h)
gl.w = w
gl.h = h
}

// resize viewport
function gl_viewport(w, h) {
gl.viewport(0, 0, w, h)
}

// make program from shader sources (vertex, fragment)
function gl_program(vs, fs) {
p = gl.createProgram()

_glcs = (p, s, t) => {
var sh = gl.createShader(t ? 35632 : 35633)
gl.shaderSource(sh, s)
gl.compileShader(sh)
gl.attachShader(p, sh)
}

_glcs(p, vs, 0)
_glcs(p, fs, 1)
gl.linkProgram(p)
gl.validateProgram(p)
gl_use(p)
return p
}

// use program
function gl_use(p) {
gl.useProgram(p)
program = p
}

// create a texture
function gl_texture() {
return gl.createTexture()
}

function gl_update_texture(texture, data, nearest = false, float = false, w=0, h=0) {
let ifo = float?34836:6408
let fo = float?5126:5121

gl.bindTexture(3553, texture)
if (data) {
gl.pixelStorei(37443, 0)
gl.pixelStorei(37440, true)
}
if (w==0) {
gl.texImage2D(3553, 0, ifo, 6408, fo, data)
} else {
gl.texImage2D(3553, 0, ifo, w, h, 0, 6408, fo, data)
}
gl.texParameteri(3553, 10240, nearest||(float&&!gl._floatlinear) ? 9728 : 9729)
gl.texParameteri(3553, 10241, nearest||(float&&!gl._floatlinear) ? 9728 : 9729)
gl.texParameteri(3553, 10242, 33071)
gl.texParameteri(3553, 10243, 33071)
}

// get uniform / attribute location

function gl_uniform(name, unit=0) {
return gl.getUniformLocation(program, name, unit)
}

function gl_attribute(name) {
return gl.getAttribLocation(program, name)
}

// set uniforms
function gl_float(location, value) {
gl.uniform1f(location, value)
}

function gl_float2(location, value, value2) {
gl.uniform2f(location, value, value2)
}

function gl_matrix(location, value) {
gl.uniformMatrix4fv(location, false, value)
}

function gl_bind_texture(location, texture, unit=0 ) {
gl.activeTexture(33984 + unit)
gl.bindTexture(3553, texture)
gl.uniform1i(location, unit)
}

// create buffer
function gl_buffer() {
return gl.createBuffer()
}

// update buffer data
function gl_update_buffer(buffer, data) {
gl.bindBuffer(34962, buffer)
gl.bufferData(34962, data, 35048)
}

function gl_vao() {
const vao = gl.createVertexArray()
gl.bindVertexArray(vao)
return vao
}

function gl_bind_vao(vao) {
gl.bindVertexArray(vao)
}

// bind vertex attrib array
function gl_vaa(location, buffer, size = 4, stride = 0, offset = 0) {
gl.bindBuffer(34962, buffer)
gl.vertexAttribPointer(location, size, 5126, 0, stride, offset)
gl.enableVertexAttribArray(location)
}

function gl_framebuffer(w, h, needsdepth=false, nearest=false, float=true) {
var texture = gl_texture()
gl_update_texture(texture, null, nearest, float, w, h)

var frameBuffer = gl.createFramebuffer()
gl.bindFramebuffer(36160, frameBuffer)
gl.framebufferTexture2D(36160, 36064, 3553, texture, 0)

var depthBuffer;
if (needsdepth) {
depthBuffer = gl.createRenderbuffer()
gl.bindRenderbuffer(36161, depthBuffer)
gl.renderbufferStorage(36161, 33189, w, h)
gl.framebufferRenderbuffer(36160, 36096, 36161, depthBuffer)
}


return {f:frameBuffer, t:texture, d:depthBuffer, w:w, h:h}
}

function gl_use_framebuffer(framebuffer) {
let fb = null
let w = gl.w
let h = gl.h
if (framebuffer) {
fb = framebuffer.f
w = framebuffer.w
h = framebuffer.h
}
gl.bindFramebuffer(36160, fb)
gl_viewport(w, h)
}

function gl_draw_triangles(count) {
gl.drawArrays(4, 0, count)
}
