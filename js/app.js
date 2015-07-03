var TableComponent = React.createClass({

    getInitialState: function () {
        return {
            data: [],
            sortDir: 'ascending',
            selectedColumn: ''
        };
    },

    componentDidMount: function () {
        $.getJSON(this.props.src, {
            format: "json"
        }).done(function (data) {
            if (this.isMounted()) {
                this.setState({
                    data: data
                });
            }
        }.bind(this));
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
                <table>
                    <TableCaption caption={this.props.caption} description={this.state.description || ''} />
                    <thead>
                        <TableHeader onSort={this.sort} sortDir={this.state.lastSortDir} columns={columns} selectedColumn={this.state.selectedColumn}/>
                    </thead>
                    <TableBody data={data} columns={columns} />
                </table>
            )
        } else {
            return (
                <table></table>
            )
        }
    }
});


var TableHeader = React.createClass({

    propTypes: {
        sortDir: React.PropTypes.oneOf(['ascending', 'descending', '']),
        onSort: React.PropTypes.func
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
                            className={ this.props.sortDir || '' }
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
                            onKeyDown={this.sort(c)}
                            onClick={this.sort(c)}
                            key={c}>{c}</th>
                    );
                }
            }, this);
        }.bind(this);


        return (
            <tr key="headerRow">{ cell(this.props.item, this.props.selectedColumn) }</tr>
        )
    }
});

var TableCaption = React.createClass({
    propTypes: {
        caption: React.PropTypes.string,
        description: React.PropTypes.string
    },

    render: function () {
        return (
            <caption role="status" aria-live="assertive" aria-relevant="all" aria-atomic="true">{this.props.caption + " " + this.props.description}</caption>
        )
    }
});


var TableBody = React.createClass({
    render: function () {
        var columns = this.props.columns;
        return (
            <tbody>
            {this.props.data.map(function (item, idx) {
                return (
                    <TableRow key={idx} data={item} columns={columns}/>
                );
            })}
            </tbody>
        );
    }
});


var TableRow = React.createClass({
    render: function () {
        var columns = this.props.columns;
        var data = this.props.data;
        var td = function (item) {

        return columns.map(function (c, i) {
                return <td key={i}>{item[c]}</td>;
            }, this);
        }.bind(this);

        return (
            <tr key={data}>{ td(data) }</tr>
        )
    }
});


React.render(
    <TableComponent caption="Foo" src="./data/data.json" />, document.getElementById('table')
)
