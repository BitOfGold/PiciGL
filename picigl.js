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
        if (!e) { //DEBUG
            console.warn("Can't get extension "+name) //DEBUG
        } //DEBUG
        return e
    }

    _glge('EXT_color_buffer_float')
    _glge('EXT_float_blend')
    gl._floatlinear = _glge('OES_texture_float_linear')
    gl.clearColor(0, 0, 0, 1)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.enable(gl.DEPTH_TEST)
    gl.w = canvas.width
    gl.h = canvas.height
}


// clear
function gl_clear(depth=true) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
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
        var sh = gl.createShader(t ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER)
        gl.shaderSource(sh, s)
        gl.compileShader(sh)
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { //DEBUG
            console.warn((t ? 'fragment' : 'vertex') + ' shader error:\n' + gl.getShaderInfoLog(sh)) //DEBUG
            gl.deleteShader(sh) //DEBUG
            return null //DEBUG
        } //DEBUG
        gl.attachShader(p, sh)
    }

    _glcs(p, vs, 0)
    _glcs(p, fs, 1)
    gl.linkProgram(p)
    gl.validateProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { //DEBUG
        console.warn(' gl error:\n' + gl.getProgramInfoLog(p)) //DEBUG
    } //DEBUG
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
    let ifo = float?gl.RGBA32F:gl.RGBA
    let fo = float?gl.FLOAT:gl.UNSIGNED_BYTE

    gl.bindTexture(gl.TEXTURE_2D, texture)
    if (data) {
        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)    
    }
    if (w==0) {
        gl.texImage2D(gl.TEXTURE_2D, 0, ifo, gl.RGBA, fo, data)
    } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, ifo, w, h, 0, gl.RGBA, fo, data)
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, nearest||(float&&!gl._floatlinear) ? gl.NEAREST : gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, nearest||(float&&!gl._floatlinear) ? gl.NEAREST : gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
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
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.uniform1i(location, unit)
}

// create buffer
function gl_buffer() {
    return gl.createBuffer()
}

// update buffer data
function gl_update_buffer(buffer, data) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)
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
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(location, size, gl.FLOAT, 0, stride, offset)
    gl.enableVertexAttribArray(location)
}

function gl_framebuffer(w, h, needsdepth=false, nearest=false, float=true) {
    var texture = gl_texture()
    gl_update_texture(texture, null, nearest, float, w, h)

    var frameBuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    
    var depthBuffer;
    if (needsdepth) {
        depthBuffer = gl.createRenderbuffer()
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h)
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)    
    }

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER) // DEBUG
    if (status !== gl.FRAMEBUFFER_COMPLETE) { //DEBUG
        console.warn("Can't create framebuffer") //DEBUG
    } //DEBUG

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
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl_viewport(w, h)
}

function gl_draw_triangles(count) {
    gl.drawArrays(gl.TRIANGLES, 0, count)
}
