(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var TableComponent = React.createClass({
    displayName: 'TableComponent',

    getInitialState: function getInitialState() {
        return {
            data: [],
            sortDir: 'ascending',
            selectedColumn: ''
        };
    },

    componentDidMount: function componentDidMount() {
        $.getJSON(this.props.src, {
            format: 'json'
        }).done((function (data) {
            if (this.isMounted()) {
                this.setState({
                    data: data
                });
            }
        }).bind(this));
    },

    getColumnNames: function getColumnNames() {
        if (this.isMounted()) {
            var firstEl = this.state.data[0];
            return Object.keys(firstEl);
        }
    },

    sortByColumn: function sortByColumn(array, column, sortDir) {
        return array.sort(function (a, b) {
            var x = a[column];
            var y = b[column];
            if (sortDir === 'descending') {
                return x > y ? -1 : x < y ? 1 : 0;
            } else {
                return x < y ? -1 : x > y ? 1 : 0;
            }
        });
    },

    sort: function sort(column) {
        this.setState({
            lastSortDir: this.state.sortDir,
            selectedColumn: column,
            sortDir: this.state.sortDir === 'ascending' ? 'descending' : 'ascending',
            description: ' sorted by ' + column + ' ' + this.state.sortDir,
            data: this.sortByColumn(this.state.data, column, this.state.sortDir)
        });
    },

    render: function render() {
        var columns = this.getColumnNames();
        var data = this.state.data;

        if (this.isMounted()) {
            return React.createElement(
                'table',
                null,
                React.createElement(TableCaption, { caption: this.props.caption, description: this.state.description || '' }),
                React.createElement(
                    'thead',
                    null,
                    React.createElement(TableHeader, { onSort: this.sort, sortDir: this.state.lastSortDir, columns: columns, selectedColumn: this.state.selectedColumn })
                ),
                React.createElement(TableBody, { data: data, columns: columns })
            );
        } else {
            return React.createElement('table', null);
        }
    }
});

var TableHeader = React.createClass({
    displayName: 'TableHeader',

    propTypes: {
        sortDir: React.PropTypes.oneOf(['ascending', 'descending', '']),
        onSort: React.PropTypes.func
    },

    sort: function sort(column) {
        return (function (event) {

            var code = event.charCode || event.keyCode,
                type = event.type,
                ENTER = 13,
                SPACE = 32;

            if (type === 'click' || (code === 13 || code === 32)) {

                if (code !== ENTER && code !== SPACE) {
                    event.stopPropagation();
                } else if (code === SPACE) {
                    event.preventDefault();
                }

                this.props.onSort(column);
            }
        }).bind(this);
    },

    /* if the selectedColumn matches this column update the aria-sort */
    render: function render() {
        var selectedColumn = this.props.selectedColumn;
        var cell = (function () {
            return this.props.columns.map(function (c, i) {

                // if the selectedColumn matches this collumn
                // add the up/down icons and aria-sort attribute
                if (c === selectedColumn) {
                    return React.createElement(
                        'th',
                        { scope: 'col',
                            tabIndex: '0',
                            role: 'columnheader',
                            className: this.props.sortDir || '',
                            'aria-sort': this.props.sortDir || '',
                            onKeyDown: this.sort(c),
                            onClick: this.sort(c),
                            key: c },
                        c,
                        React.createElement('span', { className: 'icon', 'aria-hidden': 'true' })
                    );
                } else {
                    return React.createElement(
                        'th',
                        { scope: 'col',
                            tabIndex: '0',
                            role: 'columnheader',
                            onKeyDown: this.sort(c),
                            onClick: this.sort(c),
                            key: c },
                        c
                    );
                }
            }, this);
        }).bind(this);

        return React.createElement(
            'tr',
            { key: 'headerRow' },
            cell(this.props.item, this.props.selectedColumn)
        );
    }
});

var TableCaption = React.createClass({
    displayName: 'TableCaption',

    propTypes: {
        caption: React.PropTypes.string,
        description: React.PropTypes.string
    },

    render: function render() {
        return React.createElement(
            'caption',
            { role: 'status', 'aria-live': 'assertive', 'aria-relevant': 'all', 'aria-atomic': 'true' },
            this.props.caption + ' ' + this.props.description
        );
    }
});

var TableBody = React.createClass({
    displayName: 'TableBody',

    render: function render() {
        var columns = this.props.columns;
        return React.createElement(
            'tbody',
            null,
            this.props.data.map(function (item, idx) {
                return React.createElement(TableRow, { key: idx, data: item, columns: columns });
            })
        );
    }
});

var TableRow = React.createClass({
    displayName: 'TableRow',

    render: function render() {
        var columns = this.props.columns;
        var data = this.props.data;
        var td = (function (item) {

            return columns.map(function (c, i) {
                return React.createElement(
                    'td',
                    { key: i },
                    item[c]
                );
            }, this);
        }).bind(this);

        return React.createElement(
            'tr',
            { key: data },
            td(data)
        );
    }
});

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
})(undefined, function () {

    // Return the components top level function as the exported value.
    // usage, ex:
    // React.render(
    //     <TableComponent caption="Foo" src="./data/data.json" />, document.getElementById('table')
    // );
    return TableComponent;
});

},{}],2:[function(require,module,exports){
"use strict";

var TableComponent = require("./TableComponent");

React.render(React.createElement(TableComponent, { caption: "Foo", src: "./data/data.json" }), document.getElementById("table"));

},{"./TableComponent":1}]},{},[2]);
