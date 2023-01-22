import React, { createRef, Component } from "react";
import './TSVis.css'

class TSVis extends Component {

    cnt = 0
    BUFFERSIZE = 1000
    DT = 100
    tPrev = undefined
    VMIN = 0
    VMAX = 1

    ctx = undefined
    // WIDTH = undefined
    // HEIGHT = undefined
    X0 = undefined
    Y0 = undefined
    xPrev = undefined
    yPrev = undefined
    DX = undefined
    MARGIN = 0.05

    setParams = (params) => {
        let elmCanvas = this.canvas.current
        if (params.height != undefined) {
            elmCanvas.height = params.height
            this.Y0 = elmCanvas.height * 0.50
        }

        if (params.width != undefined) {
            elmCanvas.width = params.width
            this.X0 = elmCanvas.clientWidth * this.MARGIN
            this.DX = (elmCanvas.clientWidth - 2 * this.X0) / this.BUFFERSIZE
        }
    }

    drawLine = (info, style = {}) => {
        const { x1, y1, x2, y2 } = info;
        const { color = 'black', width = 1 } = style;

        this.ctx.clearRect(x1, 0, x2 - x1, this.canvas.current.clientHeight)
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.stroke();
    }

    map2y = (v) => {

        this.VMIN += (v - this.VMIN) * 1.0 / this.BUFFERSIZE
        this.VMAX += (v - this.VMAX) * 1.0 / this.BUFFERSIZE

        this.VMIN = Math.min(this.VMIN, v)
        this.VMAX = Math.max(this.VMAX, v)

        let height = this.canvas.current.clientHeight

        let vMapped = this.Y0 + height * (0.5 - this.MARGIN) - height * (1 - this.MARGIN * 2) * (v - this.VMIN) / (this.VMAX - this.VMIN)

        return vMapped
    }

    updateTSVis = (tsNew) => {

        // initialization
        if (this.ctx === undefined) {
            let elmCanvas = this.canvas.current
            this.setParams({ width: elmCanvas.clientWidth, height: elmCanvas.clientHeight })
            this.ctx = elmCanvas.getContext("2d")
        }

        for (let dp of tsNew) {
            if (this.cnt === 0) {
                this.xPrev = this.X0
                this.yPrev = this.map2y(dp.value)
            }
            this.cnt = (this.cnt + 1) % this.BUFFERSIZE

            let dt
            if (this.tPrev === undefined || dp.time == undefined) {
                dt = this.DT
            } else {
                dt = dp.time - this.tPrev
                this.tPrev = dp.time
            }

            let dx = dt / this.DT * this.DX
            let y2 = this.map2y(dp.value)
            this.drawLine({ x1: this.xPrev, y1: this.yPrev, x2: this.xPrev + dx, y2: y2 })

            this.xPrev = this.xPrev + dx
            this.yPrev = y2
        }
    }

    constructor(props) {
        super(props)
        this.canvas = createRef()
    }

    render() {
        return (
            <canvas ref={this.canvas}></canvas>
        )
    }
}

export default TSVis