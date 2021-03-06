"use strict";

require("viz/tree_map/tree_map");

var $ = require("jquery"),
    vizMocks = require("../../helpers/vizMocks.js"),
    module = require("viz/core/loading_indicator");

$("#qunit-fixture").append('<div id="test-container" style="width: 600px; height: 400px;"></div>');

QUnit.module("Loading indicator", {
    beforeEach: function() {
        var loadingIndicator = this.loadingIndicator = new vizMocks.LoadingIndicator();
        module.LoadingIndicator = sinon.spy(function() { return loadingIndicator; });
        this.$container = $("#test-container");
    },

    createWidget: function(options) {
        return this.$container.dxTreeMap(options).dxTreeMap("instance");
    }
});

QUnit.test("Show", function(assert) {
    var widget = this.createWidget({
        loadingIndicator: { text: "Some text" }
    });

    widget.showLoadingIndicator();

    var params = module.LoadingIndicator.lastCall.args[0];
    assert.ok(params.renderer, "param - renderer");
    assert.ok(typeof params.eventTrigger === "function", "param - event trigger");
    assert.ok(typeof params.notify === "function", "param - notify");
    assert.deepEqual(this.loadingIndicator.setSize.lastCall.args, [{ width: 600, height: 400, left: 0, top: 0, right: 0, bottom: 0 }], "canvas");
    assert.deepEqual(this.loadingIndicator.setOptions.lastCall.args[0].text, "Some text", "options");
    assert.deepEqual(this.loadingIndicator.show.lastCall.args, [], "show");
});

QUnit.test("Show when container is not visible", function(assert) {
    this.$container.hide();
    var widget = this.createWidget();

    widget.showLoadingIndicator();

    assert.deepEqual(this.loadingIndicator.setSize.lastCall.args, [{ width: 600, height: 400, left: 0, top: 0, right: 0, bottom: 0 }], "canvas");
    assert.deepEqual(this.loadingIndicator.show.lastCall.args, [], "show");
});

QUnit.test("Notification callback / true", function(assert) {
    var widget = this.createWidget(),
        spy = widget._hideTooltip = sinon.spy();

    module.LoadingIndicator.lastCall.args[0].notify(true);

    assert.strictEqual(widget.option("loadingIndicator.show"), true, "option state");
    assert.deepEqual(spy.lastCall.args, [], "tooltip is hidden");
});

QUnit.test("Notification callback / false", function(assert) {
    var widget = this.createWidget();

    module.LoadingIndicator.lastCall.args[0].notify(false);

    assert.strictEqual(widget.option("loadingIndicator.show"), false, "option state");
});

QUnit.test("Hide", function(assert) {
    var widget = this.createWidget();

    widget.hideLoadingIndicator();

    assert.deepEqual(this.loadingIndicator.hide.lastCall.args, [], "hide");
});

QUnit.test("_scheduleLoadingIndicatorHiding", function(assert) {
    var widget = this.createWidget();

    widget._scheduleLoadingIndicatorHiding();

    assert.deepEqual(this.loadingIndicator.scheduleHiding.lastCall.args, [], "scheduled");
});

QUnit.test("_fulfillLoadingIndicatorHiding", function(assert) {
    var widget = this.createWidget();

    widget._fulfillLoadingIndicatorHiding();

    assert.deepEqual(this.loadingIndicator.fulfillHiding.lastCall.args, [], "fulfilled");
});

QUnit.test("'loadingIndicator' option", function(assert) {
    var widget = this.createWidget();
    widget.showLoadingIndicator();

    widget.option("loadingIndicator", { backgroundColor: "red" });

    assert.deepEqual(this.loadingIndicator.setOptions.lastCall.args[0].backgroundColor, "red", "options");
    assert.strictEqual(this.loadingIndicator.stub("hide").lastCall, null, "not hidden");   // Why hidden?
});

QUnit.test("Hidden when theme is changed", function(assert) {
    var widget = this.createWidget();
    widget.showLoadingIndicator();

    widget.option("theme", "test-theme");

    assert.deepEqual(this.loadingIndicator.scheduleHiding.lastCall.args, [], "schedule");
    assert.deepEqual(this.loadingIndicator.fulfillHiding.lastCall.args, [], "fulfilled");
});

QUnit.test("Hidden when data source is changed", function(assert) {
    var widget = this.createWidget();
    widget.showLoadingIndicator();

    widget.option("dataSource", [{ value: 1 }]);

    assert.deepEqual(this.loadingIndicator.scheduleHiding.lastCall.args, [], "schedule");
    assert.deepEqual(this.loadingIndicator.fulfillHiding.lastCall.args, [], "fulfilled");
});

QUnit.test("Hiding is scheduled on any option change", function(assert) {
    var widget = this.createWidget();

    widget.option("test-option", "test-value");

    assert.deepEqual(this.loadingIndicator.scheduleHiding.lastCall.args, []);
});

QUnit.test("Depends on theme", function(assert) {
    var widget = this.createWidget();
    this.loadingIndicator.setOptions.reset();

    widget.option("theme", "test-theme");

    assert.strictEqual(this.loadingIndicator.setOptions.callCount, 1);
});
