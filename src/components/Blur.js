import React, { Component } from 'react';
import './Blur.css'

export class Blur extends Component {
    constructor(props) {
        super(props)

        this.state = {

        }
        this.minWidth = 10;
        this.minHeight = 10;

        // Thresholds
        this.margins = 4;

        // End of what's configurable.
        this.clicked = null;
        this.onRightEdge = false;
        this.onBottomEdge = false;
        this.onLeftEdge = false;
        this.onTopEdge = false;

        // this.rightScreenEdge;
        // this.bottomScreenEdge;


        this.b = {}; this.x = 0; this.y = 0;

        this.mouse = {
            x: 0,
            y: 0,
            startX: 0,
            startY: 0
        };

        this.rectangleElement = null;
        this.counter = 0;

        this.pane = null;
        this.targetElementId = null;
        this.e = null;
    }

    componentDidMount() {
        // Mouse events
        document.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mousemove', this.onMove);
        document.addEventListener('mouseup', this.onUp);

        this.animate()
    }

    animate = () => {

        requestAnimationFrame(this.animate);
        if (this.pane != null) {

            if (this.clicked && this.clicked.isResizing) {

                if (this.clicked.onRightEdge) this.pane.style.width = Math.max(this.x, this.minWidth) + 'px';
                if (this.clicked.onBottomEdge) this.pane.style.height = Math.max(this.y, this.minHeight) + 'px';

                if (this.clicked.onLeftEdge) {
                    var currentWidth = Math.max(this.clicked.cx - this.e.clientX + this.clicked.w, this.minWidth);
                    if (currentWidth > this.minWidth) {
                        this.pane.style.width = currentWidth + 'px';
                        this.pane.style.left = this.e.clientX + 'px';
                    }
                }

                if (this.clicked.onTopEdge) {
                    var currentHeight = Math.max(this.clicked.cy - this.e.clientY + this.clicked.h, this.minHeight);
                    if (currentHeight > this.minHeight) {
                        this.pane.style.height = currentHeight + 'px';
                        this.pane.style.top = this.e.clientY + 'px';
                    }
                }
                return;
            }

            if (this.clicked && this.clicked.isMoving) {

                // moving
                this.pane.style.top = (this.e.clientY - this.clicked.y + window.pageYOffset) + 'px';
                this.pane.style.left = (this.e.clientX - this.clicked.x + window.pageXOffset) + 'px';

                return;
            }

            // This code executes when mouse moves without clicking

            // style cursor
            if (this.onRightEdge && this.onBottomEdge || this.onLeftEdge && this.onTopEdge) {
                this.pane.style.cursor = 'nwse-resize';
            } else if (this.onRightEdge && this.onTopEdge || this.onBottomEdge && this.onLeftEdge) {
                this.pane.style.cursor = 'nesw-resize';
            } else if (this.onRightEdge || this.onLeftEdge) {
                this.pane.style.cursor = 'ew-resize';
            } else if (this.onBottomEdge || this.onTopEdge) {
                this.pane.style.cursor = 'ns-resize';
            } else {
                this.pane.style.cursor = 'move';
            }
        }

    }

    calc = (e) => {
        this.mouse.x = e.clientX + window.pageXOffset;
        this.mouse.y = e.clientY + window.pageYOffset;
        if (this.pane != null) {

            this.b = this.pane.getBoundingClientRect();
            this.x = this.e.clientX - this.b.left;
            this.y = this.e.clientY - this.b.top;
            this.onTopEdge = this.y < this.margins;
            this.onLeftEdge = this.x < this.margins;
            this.onRightEdge = this.x >= this.b.width - this.margins;
            this.onBottomEdge = this.y >= this.b.height - this.margins;

            // this.rightScreenEdge = window.innerWidth - this.margins;
            // this.bottomScreenEdge = window.innerHeight - this.margins;
        }

    }

    onMouseDown = (e) => {
        this.onDown(e);
        e.preventDefault();
    }

    onDown = (e) => {
        this.calc(e);
        if (e.target.className != 'pane') {
            this.mouse.startX = this.mouse.x;
            this.mouse.startY = this.mouse.y;
            this.rectangleElement = document.createElement('div');
            this.rectangleElement.className = 'pane';
            this.rectangleElement.id = `rect${this.counter++}`;
            document.body.appendChild(this.rectangleElement)
            document.body.style.cursor = "crosshair";
        } else {
            this.pane = document.getElementById(e.target.id);
            this.pane.style.zIndex = 2;
            this.targetElementId = e.target.id;
            this.isResizing = this.onRightEdge || this.onBottomEdge || this.onTopEdge || this.onLeftEdge;

            this.clicked = {
                x: this.x,
                y: this.y,
                cx: e.clientX,
                cy: e.clientY,
                w: this.b.width,
                h: this.b.height,
                isResizing: this.isResizing,
                isMoving: !this.isResizing,
                onTopEdge: this.onTopEdge,
                onLeftEdge: this.onLeftEdge,
                onRightEdge: this.onRightEdge,
                onBottomEdge: this.onBottomEdge
            };
        }

    }

    onMove = (ee) => {
        this.calc(ee);
        this.e = ee;

        if (!ee.target.id.includes('rect')) {
            this.pane = document.getElementById(this.targetElementId);
        } else {
            this.pane = document.getElementById(ee.target.id);
        }

        if (this.rectangleElement !== null) {
            this.rectangleElement.style.width = Math.abs(this.mouse.x - this.mouse.startX) + 'px';
            this.rectangleElement.style.height = Math.abs(this.mouse.y - this.mouse.startY) + 'px';
            this.rectangleElement.style.left = (this.mouse.x - this.mouse.startX < 0) ? this.mouse.x + 'px' : this.mouse.startX + 'px';
            this.rectangleElement.style.top = (this.mouse.y - this.mouse.startY < 0) ? this.mouse.y + 'px' : this.mouse.startY + 'px';
        }
    }

    onUp = (e) => {
        this.calc(e);
        this.clicked = null;
        // console.log(this.pane.style.zIndex)
        if (this.pane) this.pane.style.zIndex = 1;
        this.rectangleElement = null;
        document.body.style.cursor = "default";
    }

    render() {
        return (
            <div>
                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                    industry's
                    standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to
                    make
                    a type specimen book. It has survived not only five centuries, but also the leap into electronic
                    typesetting,
                    remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
                    containing
                    Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including
                    versions
                    of Lorem Ipsum.Why do we use it?It is a long established fact that a reader will be distracted by the
                    readable
                    content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less
                    normal distribution of letters, as opposed to using 'Content here, content here', making it look like
                    readable
                    English. Many desktop publishing
                    packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem
                    ipsum'
                    will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes
                    by
                    accident, sometimes on purpose (injected humour and the like).Where does it come from?Contrary to popular
                    belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45
                    BC,
                    making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney
                    College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage,
                    and
                    going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum
                    comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil)
                    by
                    Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the
                    Renaissance.
                    The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.The
                    standard
                    chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections
                    1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact
                    original
                    form, accompanied by English versions from the 1914 translation by H. Rackham.Where can I get some?
                    There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in
                    some form, by injected humour, or randomised words which don't look even slightly believable. If you are
                    going
                    to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle
                    of
                    text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making
                    this
                    the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a
                    handful
                    of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is
                    therefore always free from repetition, injected humour, or non-characteristic words etc.
                </p>
                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                    industry's
                    standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to
                    make
                    a type specimen book. It has survived not only five centuries, but also the leap into electronic
                    typesetting,
                    remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
                    containing
                    Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including
                    versions
                    of Lorem Ipsum.Why do we use it?It is a long established fact that a reader will be distracted by the
                    readable
                    content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less
                    normal distribution of letters, as opposed to using 'Content here, content here', making it look like
                    readable
                    English. Many desktop publishing
                    packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem
                    ipsum'
                    will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes
                    by
                    accident, sometimes on purpose (injected humour and the like).Where does it come from?Contrary to popular
                    belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45
                    BC,
                    making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney
                    College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage,
                    and
                    going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum
                    comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil)
                    by
                    Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the
                    Renaissance.
                    The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.The
                    standard
                    chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections
                    1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact
                    original
                    form, accompanied by English versions from the 1914 translation by H. Rackham.Where can I get some?
                    There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in
                    some form, by injected humour, or randomised words which don't look even slightly believable. If you are
                    going
                    to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle
                    of
                    text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making
                    this
                    the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a
                    handful
                    of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is
                    therefore always free from repetition, injected humour, or non-characteristic words etc.
                </p>
                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                    industry's
                    standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to
                    make
                    a type specimen book. It has survived not only five centuries, but also the leap into electronic
                    typesetting,
                    remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
                    containing
                    Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including
                    versions
                    of Lorem Ipsum.Why do we use it?It is a long established fact that a reader will be distracted by the
                    readable
                    content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less
                    normal distribution of letters, as opposed to using 'Content here, content here', making it look like
                    readable
                    English. Many desktop publishing
                    packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem
                    ipsum'
                    will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes
                    by
                    accident, sometimes on purpose (injected humour and the like).Where does it come from?Contrary to popular
                    belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45
                    BC,
                    making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney
                    College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage,
                    and
                    going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum
                    comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil)
                    by
                    Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the
                    Renaissance.
                    The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.The
                    standard
                    chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections
                    1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact
                    original
                    form, accompanied by English versions from the 1914 translation by H. Rackham.Where can I get some?
                    There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in
                    some form, by injected humour, or randomised words which don't look even slightly believable. If you are
                    going
                    to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle
                    of
                    text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making
                    this
                    the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a
                    handful
                    of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is
                    therefore always free from repetition, injected humour, or non-characteristic words etc.
                </p>
                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                    industry's
                    standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to
                    make
                    a type specimen book. It has survived not only five centuries, but also the leap into electronic
                    typesetting,
                    remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
                    containing
                    Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including
                    versions
                    of Lorem Ipsum.Why do we use it?It is a long established fact that a reader will be distracted by the
                    readable
                    content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less
                    normal distribution of letters, as opposed to using 'Content here, content here', making it look like
                    readable
                    English. Many desktop publishing
                    packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem
                    ipsum'
                    will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes
                    by
                    accident, sometimes on purpose (injected humour and the like).Where does it come from?Contrary to popular
                    belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45
                    BC,
                    making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney
                    College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage,
                    and
                    going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum
                    comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil)
                    by
                    Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the
                    Renaissance.
                    The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.The
                    standard
                    chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections
                    1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact
                    original
                    form, accompanied by English versions from the 1914 translation by H. Rackham.Where can I get some?
                    There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in
                    some form, by injected humour, or randomised words which don't look even slightly believable. If you are
                    going
                    to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle
                    of
                    text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making
                    this
                    the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a
                    handful
                    of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is
                    therefore always free from repetition, injected humour, or non-characteristic words etc.
                </p>
            </div>
        )
    }
}

export default Blur