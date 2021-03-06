"use strict";

var isDefined = require("../../core/utils/type").isDefined,
    extend = require("../../core/utils/extend").extend;

function getPathStyle(options) {
    return { stroke: options.color, "stroke-width": options.width, "stroke-opacity": options.opacity };
}

function createTick(axis, renderer, tickOptions, gridOptions, skippedCategory, skipLabels, offset) {
    var tickOffset = offset || axis._tickOffset,
        lineGroup = axis._axisLineGroup,
        elementsGroup = axis._axisElementsGroup,
        tickStyle = getPathStyle(tickOptions),
        gridStyle = getPathStyle(gridOptions),
        emptyStrRegExp = /^\s+$/,

        axisOptions = axis.getOptions(),
        labelOptions = axisOptions.label,
        labelStyle = axis._textOptions;

    function getLabelFontStyle(tick) {
        var fontStyle = axis._textFontStyles,
            customizeColor = labelOptions.customizeColor;

        if(customizeColor && customizeColor.call) {
            fontStyle = extend({}, axis._textFontStyles, { fill: customizeColor.call(tick, tick) });
        }

        return fontStyle;
    }

    return function(value) {
        var tick = {
            value: value,
            initCoords: function() {
                this.coords = axis._getTranslatedValue(value, tickOffset);
                this.labelCoords = axis._getTranslatedValue(value);
            },
            drawMark: function() {
                if(!tickOptions.visible || skippedCategory === value) {
                    return;
                }

                if(axis.areCoordsOutsideAxis(this.coords)) {
                    return;
                }

                this.mark = axis._createPathElement([], tickStyle).append(lineGroup);
                this.updateTickPosition();
            },
            updateTickPosition: function() {
                if(!this.mark) {
                    return;
                }

                this.mark.attr({
                    points: axis._getTickMarkPoints(tick, tickOptions.length)
                });

                this.coords.angle && axis._rotateTick(this.mark, this.coords);
            },
            drawLabel: function(range) {
                if(!labelOptions.visible || skipLabels) {
                    return;
                }

                if(axis.areCoordsOutsideAxis(this.labelCoords)) {
                    return;
                }

                var text = axis.formatLabel(value, labelOptions, range),
                    labelHint;

                if(isDefined(text) && text !== "" && !emptyStrRegExp.test(text)) {
                    this.label = renderer
                        .text(text)
                        .css(getLabelFontStyle(this))
                        .attr(labelStyle)
                        .data("chart-data-argument", this.value)
                        .append(elementsGroup);

                    this.updateLabelPosition();

                    labelHint = axis.formatHint(this.value, labelOptions, range);
                    if(isDefined(labelHint) && labelHint !== "") {
                        this.label.setTitle(labelHint);
                    }
                }
            },
            updateLabelPosition: function() {
                if(!this.label) {
                    return;
                }

                this.label.attr({
                    x: this.labelCoords.x,
                    y: this.labelCoords.y
                });
            },
            drawGrid: function(drawLine) {
                if(gridOptions.visible && skippedCategory !== this.value) {
                    this.grid = drawLine(this, gridStyle);
                    this.grid && this.grid.append(axis._axisGridGroup);
                }
            },
            updateGridPosition: function(updateLine) {
                this.grid && this.grid.attr(axis._getGridPoints(tick.coords));
            }
        };
        return tick;
    };
}

exports.tick = createTick;
