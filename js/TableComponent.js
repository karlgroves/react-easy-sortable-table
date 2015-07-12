var TableComponent = React.createClass({

    propTypes: {
        caption: React.PropTypes.string,
        data: React.PropTypes.array,
        src: React.PropTypes.string,
        tableClass: React.PropTypes.string,
        trClass: React.PropTypes.string,
        thClass: React.PropTypes.string,
        tdClass: React.PropTypes.string,
        captionClass: React.PropTypes.string,
        tbodyClass: React.PropTypes.string,
        theadClass: React.PropTypes.string
    },

    getDefaultProps: function() {
        return {
            caption: ' ',
            tableClass: '',
            trClass: '',
            thClass: '',
            tdClass: '',
            captionClass: '',
            tbodyClass: '',
            theadClass: ''
        }
    },


    getInitialState: function () {
        return {
            data: [],
            sortDir: 'ascending',
            selectedColumn: ''
        };
    },

    componentDidMount: function () {

        // if data is set use that otherwise do an ajax hit
        // to set the data
        if (typeof this.props.data !== 'undefined') {
            if (this.isMounted()) {
                return this.setState({
                    data: this.props.data
                });
            }
        } else {
            $.getJSON(this.props.src, {
                format: "json"
            }).done(function (data) {
                if (this.isMounted()) {
                    this.setState({
                        data: data
                    });
                }
            }.bind(this));
        }
    },

    getColumnNames: function () {
        if (this.isMounted()) {
            var firstEl = this.state.data[0];
            return Object.keys(firstEl);
        }
    },

    sortByColumn: function (array, column, sortDir) {
        return array.sort(function (a, b) {
            var x = a[column];
            var y = b[column];
            if (sortDir === 'descending') {
                return ((x > y) ? -1 : ((x < y) ? 1 : 0));
            } else {
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            }
        });
    },

    sort: function (column) {
        this.setState({
            lastSortDir: this.state.sortDir,
            selectedColumn: column,
            sortDir: (this.state.sortDir === 'ascending' ? 'descending' : 'ascending'),
            description: ' sorted by ' + column + ' ' + this.state.sortDir,
            data: this.sortByColumn(this.state.data, column, this.state.sortDir)
        });
    },

    render: function () {
        var columns = this.getColumnNames();
        var data = this.state.data;

        if (this.isMounted()) {
            return (
                <table className={this.props.tableClass} >
                    <TableCaption caption={this.props.caption} description={this.state.description || ''} captionClass={this.props.captionClass} />
                    <thead className={this.props.theadClass}>
                        <TableHeader thClass={this.props.thClass} trClass={this.props.trClass} onSort={this.sort} sortDir={this.state.lastSortDir} columns={columns} selectedColumn={this.state.selectedColumn}/>
                    </thead>
                    <TableBody trClass={this.props.trClass} tdClass={this.props.tdClass} tbodyClass={this.props.tbodyClass} data={data} columns={columns} />
                </table>
            )
        } else {
            return (
                <table className={this.props.tableClass}></table>
            )
        }
    }
});


var TableHeader = React.createClass({

    propTypes: {
        sortDir: React.PropTypes.oneOf(['ascending', 'descending', '']),
        onSort: React.PropTypes.func,
        thClass: React.PropTypes.string,
        trClass: React.PropTypes.string
    },

    sort: function (column) {
        return function (event) {

            var code = event.charCode || event.keyCode,
                type = event.type,
                ENTER = 13,
                SPACE = 32;

            if ((type === 'click') || (code === 13 || code === 32)) {

                if ((code !== ENTER) && (code !== SPACE)) {
                    event.stopPropagation();
                }
                else if (code === SPACE) {
                    event.preventDefault();
                }

                this.props.onSort(column);
            }

        }.bind(this);
    },

    /* if the selectedColumn matches this column update the aria-sort */
    render: function () {
        var selectedColumn = this.props.selectedColumn;
        var cell = function () {
            return this.props.columns.map(function (c, i) {

                // if the selectedColumn matches this collumn
                // add the up/down icons and aria-sort attribute
                if (c === selectedColumn) {
                    return (
                        <th scope="col"
                            tabIndex="0"
                            role="columnheader"
                            className={ (this.props.sortDir || '') + this.props.thClass }
                            aria-sort={ this.props.sortDir || '' }
                            onKeyDown={this.sort(c)}
                            onClick={this.sort(c)}
                            key={c}>{c}<span className="icon" aria-hidden="true"></span></th>
                    );
                } else {
                    return (
                        <th scope="col"
                            tabIndex="0"
                            role="columnheader"
                            className={ this.props.thClass }
                            onKeyDown={this.sort(c)}
                            onClick={this.sort(c)}
                            key={c}>{c}</th>
                    );
                }
            }, this);
        }.bind(this);


        return (
            <tr key="headerRow" className={this.props.trClass}>{ cell(this.props.item, this.props.selectedColumn) }</tr>
        )
    }
});

var TableCaption = React.createClass({
    propTypes: {
        caption: React.PropTypes.string,
        description: React.PropTypes.string,
        captionClass: React.PropTypes.string
    },

    render: function () {
        return (
            <caption className={this.props.captionClass} role="status" aria-live="assertive" aria-relevant="all" aria-atomic="true">{this.props.caption + " " + this.props.description}</caption>
        )
    }
});


var TableBody = React.createClass({

    propTypes: {
        tbodyClass: React.PropTypes.string,
        trClass: React.PropTypes.string,
        tdClass: React.PropTypes.string
    },


    render: function () {
        var columns = this.props.columns;
        return (
            <tbody className={this.props.tbodyClass}>
            {this.props.data.map(function (item, idx) {
                return (
                    <TableRow trClass={this.props.trClass} tdClass={this.props.tdClass} key={idx} data={item} columns={columns}/>
                );
            }.bind(this))}
            </tbody>
        );
    }
});


var TableRow = React.createClass({

    propTypes: {
        trClass: React.PropTypes.string,
        tdClass: React.PropTypes.string
    },


    render: function () {
        var columns = this.props.columns;
        var data = this.props.data;
        var td = function (item) {

        return columns.map(function (c, i) {
                return <td className={this.props.tdClass} key={i}>{item[c]}</td>;
            }, this);
        }.bind(this);

        return (
            <tr className={this.props.trClass} key={data}>{ td(data) }</tr>
        )
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
}(this, function () {

    // Return the components top level function as the exported value.
    // usage, ex:
    // React.render(
    //     <TableComponent caption="Foo" src="./data/data.json" />, document.getElementById('table')
    // );
    return TableComponent;
}));
