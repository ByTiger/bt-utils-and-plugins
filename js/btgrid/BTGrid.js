/*******************************************************************
 * @copyright © Aliaksei Puzenka, 2013-2017
 * @copyright © bytiger.com, 2013-2017
 * @version 1.0.1
 * @description
 * BTGrid is JavaScript UI component.
 * @license
 * This software is allowed to use under GPL or you need to obtain commercial license
 * to use it in non-GPL project. Please contact sales@bytiger.com for details
 *******************************************************************/

(function(){
    "use strict";

    function BTGrid(element) {
        this._element = jQuery(element);
        /**
         * reference to table object
         * @type {jQuery|null}
         * @private
         */
        this._table = null;
        /**
         * reference to header line
         * @type {jQuery|null}
         * @private
         */
        this._header = null;
        /**
         * filter popup jQuery object
         * @type {Object|null}
         * @private
         */
        this._filterPopup = null;
        /**
         * contain data about filtering:
         * [filterId][skippedValueId] = skippedValueId
         * @type {Object}
         * @private
         */
        this._filtersData = {};
        /**
         * contain records of items
         * @type {Object}
         * note: has references
         * @private
         */
        this._items = {};
        /**
         * current active editor
         * @type {jQuery|null}
         * @private
         */
        this._editor = null;

        this._css = {
            // applies to table element
            grid: "grid",
            // applies to header's row element
            headerRow: "row header",
            // applies to item's row element
            row: "row item",
            // applies to item's info row element
            row_item_info: "row record_info",
            // applies to any cell in rows (not info) in table
            cell: "cell",
            // применяется к ячейке заголовка, если сотрировка идет по данному столбцу
            sort: "sort",
            // применяется к ячейке заголовка, при сортировке по возрастанию
            sortAsc: "sort-asc",
            // применяется к ячейке заголовка, при сортировке по убыванию
            sortDesc: "sort-desc",
            // класс применяется к иконке сортировки в шапке таблицы
            iconSort: "icon-sort",
            // применяется к отображаемому элементу в фильтре если он не исключен
            checked: "checked",
            // applied to INPUT or SELECT element during edition cell content
            inlineEditor: "inline-editor",
            // применяется к ячейке заголовка, если фильтр установлен
            filter: "filter",
            // класс применяется к иконке фильтрации в шапке таблицы
            iconFilter: "icon-filter",
            // класс применяется к popup которые показывается по нажатию на кнопку фильтра в шапке
            filterPopup: "btGrid-filter-popup",
            // класс применяется к элементам в popup фильтра
            filterPopupItem: "btGrid-filter-popup-item"
        };
        /**
         * array of objects like: { id:string, title:string, filter:Array|Object, [hide:boolean], [tooltip:string], [filterTooltip:string] }
         * where:
         *   filter {Array|Object} -- list of filter items (for the Object, the keys used as ID or item, if id not exists) {id:Number, title:string, [name:string], [value:string]}
         * @type {Array}
         */
        this._columns = [];
        /**
         * array with all columns ID's
         * @type {Array}
         */
        this._columnsIds = [];
        /**
         * contain ID's of displayed columns
         * @type {Array}
         */
        this._columnsInView = [];
        /**
         * contain ID's of hidden columns (generally for restore state)
         * @type {Array}
         * @private
         */
        this._hiddenColumns = {};
        /**
         * references to column info by id
         * @type {Object}
         */
        this._columnsById = {};
        /**
         * contain information for filtering in columns
         * @type {Object}
         */
        this._columnsFilters = {};
        /**
         * references to row's view elements
         * @type {Object}
         */
        this._rowByItemId = {};
        /**
         * references to row's info view elements
         * @type {Object}
         */
        this._rowInfoByItemId = {};
        /**
         * column name for sorting
         * @type {string}
         */
        this._sortColumn = null;
        /**
         * direction of the sorting
         * @type {number}
         */
        this._sortOrder = 1;
        /**
         * auto saving filtering state to localStorage
         * @type {boolean}
         * @private
         */
        this._autoSaveState = false;
        /**
         * grid name for auto saving state
         * @type {string}
         * @private
         */
        this._gridName = this._element.attr("id") || "";
    }

    /********************************************************************************
     * private functions
     ********************************************************************************/

    /**
     * set auto saving filtering state to localStorage
     * @param {boolean|null} [isSet]
     * @param {string} [gridName]
     * @returns {boolean}
     */
    BTGrid.prototype.autoSaveState = function(isSet, gridName) {
        if(BTUtils.isDef(isSet)) {
            this._autoSaveState = !!isSet;
        }
        if(BTUtils.isDef(gridName)) {
            this._gridName = gridName;
        }
        this._loadState();
        return this._autoSaveState;
    };

    /**
     * array of object like { id:string, title:string, filter:Array|Object, [hide:boolean] }
     * to describe columns
     * note: saved reference
     * @param {Array} columns
     * @returns {BTGrid}
     */
    BTGrid.prototype.setColumns = function(columns) {
        this._columns = columns;
        this.redraw();
        return this;
    };

    /**
     * retrieve array with columns
     * @returns {Array}
     */
    BTGrid.prototype.getColumns = function() {
        return this._columns;
    };

    /**
     * return array with displayed columns ID
     * @returns {Array}
     */
    BTGrid.prototype.getDisplayedColumn = function() {
        return this._columnsInView;
    };

    /**
     * return array with all columns ID
     * @returns {Array}
     */
    BTGrid.prototype.getColumnsIds = function() {
        return this._columnsIds;
    };

    /**
     * check or set column visibility state
     * @param {string} id
     * @param {boolean} [newVal]
     * @returns {boolean|null}
     */
    BTGrid.prototype.isColumnVisible = function(id, newVal) {
        var qq;
        for(qq = 0; qq < this._columns.length; ++qq) {
            if(this._columns[qq].id !== id) {
                continue
            }

            if(BTUtils.isDef(newVal)) {
                this._columns[qq].hidden = !newVal;
                this.redraw();
            }

            return (this._columns[qq] && !this._columns[qq].hidden);
        }
        return null;
    };

    /**
     * array or object with items
     * note: saved reference
     * @param {Array|Object} items
     * @returns {BTGrid}
     */
    BTGrid.prototype.setItems = function(items) {
        if(items instanceof Array) {
            this._items = BTUtils.arrayToObject(items, "id");
        } else {
            this._items = items;
        }

        this._refresh();
        return this;
    };

    /**
     * set customer class names
     * @param {string|Object} objName -- in case of object processed like key:value pairs
     * @param {string} [className]
     * @returns {BTGrid}
     */
    BTGrid.prototype.setStyles = function(objName, className) {
        if(typeof(objName) === "object") {
            var qq;
            for(qq in objName) {
                if(objName.hasOwnProperty(qq) && BTUtils.isDef(this._css[qq])) {
                    this._css[qq] = objName[qq];
                }
            }
        } else if(typeof(this._css[objName]) !== "undefined") {
            this._css[objName] = className;
        }
        return this;
    };

    /**
     * set new value(s) for filter
     * @param {string} colId
     * @param {Array|object|string|null} filterInfo
     * @returns {BTGrid}
     */
    BTGrid.prototype.setColumnFilter = function(colId, filterInfo) {
        if(!this._columnsById[colId]) {
            return this;
        }

        this._columnsFilters[colId] = this._prepareFilterData(filterInfo);
        return this;
    };

    /**
     * return filters data, where:
     * [columnId][disabled_value_id] = disabled_value_id
     * @returns {Object}
     */
    BTGrid.prototype.getFilterSettings = function() {
        return this._filtersData;
    };

    /**
     * set new filter settings
     * note: do not call onFilterChanged
     * [columnId][disabled_value_id] = disabled_value_id
     * @returns {BTGrid}
     */
    BTGrid.prototype.setFilterSettings = function(settings) {
        if(typeof(settings) === "object" && settings !== null) {
            this._filtersData = settings;
        }
        this._updateHeaderFilterHiLite();
        this._saveState("filter");
        this._refresh();
        return this;
    };

    /**
     * set sorting parameters
     * note: do not call onSortChanged
     * @param {string} colId
     * @param {int} direction -- should be -1 or +1
     * @returns {BTGrid}
     */
    BTGrid.prototype.setSortParams = function(colId, direction) {
        if(!this._columnsById[colId]) {
            return;
        }

        this._sortColumn = colId;
        this._sortOrder = direction < 0 ? -1 : 1;
        this._updateHeaderSortHiLite();
        this._saveState("sort");
        this._refresh();
        return this;
    };

    /**
     * redraw grid
     * @returns {BTGrid}
     */
    BTGrid.prototype.redraw = function() {
        if(this._table) {
            this._detachEvents();
            this._table.remove();
            this._table = null;
        }

        this._table = jQuery("<table>", {"class":this._css.grid, "cellpadding":"0", "cellspacing":"0"});
        this._createHeader();
        this._attachEvents();
        this._table.appendTo(this._element);

        this.refresh();
        return this;
    };

    /**
     * refresh grid items
     * @returns {BTGrid}
     */
    BTGrid.prototype.refresh = function() {
        this._refresh();
        return this;
    };

    /**
     * return ref to record object
     * @param {int} itemId
     * @returns {Object|null}
     */
    BTGrid.prototype.getItem = function(itemId) {
        return this._items ? this._items[itemId] : null;
    };

    /**
     * get ref to record row
     * @param {int} recId
     * @returns {jQuery|null}
     */
    BTGrid.prototype.getItemRowView = function(recId) {
        return this._rowByItemId[recId] ? this._rowByItemId[recId] : null;
    };

    /**
     * get ref to additional record info row
     * @param {int} recId
     * @returns {jQuery|null}
     */
    BTGrid.prototype.getItemInfoRowView = function(recId) {
        return this._rowInfoByItemId[recId] ? this._rowInfoByItemId[recId] : null;
    };

    /**
     * @param {int} itemId
     * @returns {BTGrid}
     */
    BTGrid.prototype.updateItem = function(itemId) {
        var item = this._items[itemId];
        if(item && this.isRecordVisible(item, this)) {
            var view = this._rowByItemId[itemId];
            if(view) {
                this._updateRowItem(item, view);
            } else {
                var that = this;
                var recList = Object.keys(this._items);
                if(this._sortColumn) {
                    recList.sort(function(a,b) { return that.sortFunction(that._items[a], that._items[b], that._sortColumn, that._sortOrder); });
                }
                var pos = recList.indexOf(itemId);
                if(pos >= 0) {
                    view = this._createRowItem(item);
                    this._rowByItemId[itemId] = view;
                    var qq;
                    for(qq = pos - 1; qq >= 0; ++qq) {
                        if(this._rowByItemId[recList[qq]]) {
                            view.insertAfter(this._rowByItemId[recList[qq]]);
                            break;
                        }
                    }
                    if(qq > 0) {
                        view.appendTo(this._table);
                    }
                }
            }
        } else {
            this.hideItemView(itemId);
        }
        return this;
    };

    /**
     * hide item view in grid (item will not removed from collection)
     * @param {int} itemId
     * @returns {BTGrid}
     */
    BTGrid.prototype.hideItemView = function(itemId) {
        if(this._rowByItemId[itemId]) {
            this._rowByItemId[itemId].remove();
            delete this._rowByItemId[itemId];
        }

        if(this._rowInfoByItemId[itemId]) {
            this._rowInfoByItemId[itemId].remove();
            delete this._rowInfoByItemId[itemId];
        }
        return this;
    };

    /**
     * remove row and record associated to item by id
     * @param itemId
     * @returns {BTGrid}
     */
    BTGrid.prototype.removeItem = function(itemId) {
        if(this._rowByItemId[itemId]) {
            this._rowByItemId[itemId].remove();
            delete this._rowByItemId[itemId];
        }

        if(this._rowInfoByItemId[itemId]) {
            this._rowInfoByItemId[itemId].remove();
            delete this._rowInfoByItemId[itemId];
        }

        if(this._items[itemId]) {
            delete this._items[itemId];
        }
        return this;
    };

    /**
     * show row with additional item info below item's row
     * @param {int} itemId
     * @returns {jQuery}
     */
    BTGrid.prototype.showItemInfo = function(itemId) {
        if(this._rowInfoByItemId[itemId]) {
            return this._rowInfoByItemId[itemId];
        }

        return this._addItemInfo(itemId);
    };

    /**
     * hide row with additional info
     * @param itemId
     * @returns {BTGrid}
     */
    BTGrid.prototype.hideItemInfo = function(itemId) {
        if(this._rowInfoByItemId[itemId]) {
            this._rowInfoByItemId[itemId].remove();
            delete this._rowInfoByItemId[itemId];
        }
        return this;
    };

    BTGrid.prototype.cellEditMode = function(itemId, columnId) {
        var row = this._rowByItemId[itemId];
        if(!row) {
            return;
        }

        this.finishCellEditMode();

        var that = this;
        var item = this._items[itemId];
        var colInfo = this._columnsById[columnId];
        var cell = row.find(".col_" + colInfo.id);
        var tmp;
        this._editor = null;
        if(this._columnsFilters[columnId]) {
            if(this._columnsFilters[columnId].type === "list") {
                this._editor = jQuery("<select>", {"class":this._css.inlineEditor});
                tmp = {};
                BTUtils.each(this._columnsFilters[columnId].data, function(flt, id) {
                    jQuery("<option>", {"value":flt.id || id}).text(flt.value).appendTo(that._editor);
                    tmp[id] = flt.id || id;
                });
                this._editor.val(String(item[columnId]) || "");
                this._editor.get(0)._rowId = itemId;
                this._editor.get(0)._colId = columnId;
                this._editor.get(0)._dataMap = tmp;

                setTimeout(function() {
                    var event = document.createEvent('MouseEvents');
                    event.initMouseEvent('mousedown', true, true, window);
                    that._editor.get(0).dispatchEvent(event);
                }, 0);
            }
        }
        if(!this._editor && (!colInfo.filter || colInfo.filter === "text")) {
            this._editor = jQuery("<input>", {"class":this._css.inlineEditor});
            this._editor.val(item[columnId] || "");
            this._editor.get(0)._rowId = itemId;
            this._editor.get(0)._colId = columnId;
        }

        if(this._editor) {
            cell.append(this._editor);
            this._editor.on("click", BTUtils.breakEvent);
            this._editor.on("blur", this.finishCellEditMode._bind(this));
            this._editor.on("change", this.finishCellEditMode._bind(this));
            this._editor.on("keyup", function(event) {
                if(event.keyCode === 27) {
                    that.finishCellEditMode(false);
                }
                if(event.keyCode === 13) {
                    BTUtils.breakEvent(event);
                    that.finishCellEditMode();
                }
            });
            this._editor.focus();
        }
    };

    BTGrid.prototype.finishCellEditMode = function(cancelState) {
        if(!this._editor) return;

        if(cancelState !== false) {
            var itemId = this._editor.get(0)._rowId;
            var columnId = this._editor.get(0)._colId;
            var dataMap = this._editor.get(0)._dataMap;
            var newVal = this._editor.val();
            if(dataMap && dataMap[newVal]) {
                newVal = dataMap[newVal];
            }
            var item = this._items[itemId];
            if(item) {
                if(this.onRecordEditFinished(itemId, columnId, newVal) !== false) {
                    item[columnId] = newVal;
                }
                this.updateItem(item.id);
            }
        }

        this._editor.off("blur");
        this._editor.off("keypress");
        this._editor.off("mousedown mouseup");
        this._editor.remove();
        this._editor = null;
    };

    /********************************************************************************
     * support functions
     ********************************************************************************/

    /**
     * convert class names separated by space to string as selector (separated and started by dots)
     * @param {string} val
     * @returns {string}
     * @private
     */
    BTGrid.prototype._toSelector = function(val) {
        return "." + val.replace(/\s/g, ".").replace(/>/g, ">.");
    };

    /**
     * convert value to css dimention
     * @param {number|string|function}val
     * @returns {*}
     * @private
     */
    BTGrid.prototype._toCssDimention = function(val) {
        if(typeof(val) === "number") return val + "px";
        if(typeof(val) === "string") return val;
        if(typeof(val) === "function") return val();
        return null;
    };

    /**
     * @param {string} colName
     * @returns {jQuery}
     * @private
     */
    BTGrid.prototype._getHeaderCell = function(colName) {
        return this._header.find(this._toSelector(this._css.cell) + ".col_" + colName);
    };

    /********************************************************************************
     * private functions
     ********************************************************************************/

    BTGrid.prototype._attachEvents = function() {
        this._table.on("click", this._toSelector(this._css.headerRow+">"+this._css.cell), this._onHeaderClick._bind(this));
        this._table.on("contextmenu", this._toSelector(this._css.headerRow+">"+this._css.cell), this._onHeaderRightClick._bind(this));
        this._table.on("click", this._toSelector(this._css.row), this._onRecordClick._bind(this));
        // TODO commercial version
        this._table.on("contextmenu", this._toSelector(this._css.row), this._onRecordRightClick._bind(this));
        // TODO end commercial version
    };

    BTGrid.prototype._detachEvents = function() {
        this._table.off("click");
    };

    BTGrid.prototype._prepareFilterData = function(fltData) {
        if(!fltData) {
            return null;
        }

        var qq = 0;
        var res = null;
        if(fltData instanceof Array) {
            res = { type: "list", data: {} };
            for(qq = 0; qq < fltData.length; ++qq) {
                if(typeof(fltData[qq]) === "string") {
                    res.data[fltData[qq] || ""] = {
                        id: fltData[qq],
                        value: fltData[qq]
                    };
                } else {
                    res.data[fltData[qq].id] = {
                        id: fltData[qq].id,
                        value: fltData[qq].title || fltData[qq].name || fltData[qq].value || ""
                    };
                    if(fltData[qq].css) {
                        res.data[fltData[qq].id].css = fltData[qq].css;
                    }
                }
            }
        } else if(fltData instanceof Object) {
            res = { type: "list", data: {} };
            var id, keys = Object.keys(fltData);
            for(qq = 0; qq < keys.length; ++qq) {
                id = typeof(fltData[keys[qq]]) === "string" ? fltData[keys[qq]] : fltData[keys[qq]].id;
                res.data[id] = {
                    id: id,
                    value: typeof(fltData[keys[qq]]) === "string" ? fltData[keys[qq]] : (fltData[keys[qq]].title || fltData[keys[qq]].name || fltData[keys[qq]].value || "")
                };
                if(fltData[keys[qq]].css) {
                    res.data[keys[qq]].css = fltData[keys[qq]].css;
                }
            }
        } else if(fltData === "date" || fltData.substr(0, 5) === "date|") {
            res = { type: "date", format:fltData.length > 5 ? fltData.substr(5) : "yyyy-mm-dd" };
        } else if(fltData === "datetime" || fltData.substr(0, 9) === "datetime|") {
            res = { type: "date", format:fltData.length > 9 ? fltData.substr(9) : "yyyy-mm-dd HH:MM:SS" };
        } else if(fltData === "number") {
            res = { type: "number" };
        } else if(fltData === "text") {
            res = { type: "text" };
        }
        return res;
    };

    BTGrid.prototype._createHeader = function() {
        if(this._header) {
            this._header.remove();
            this._header = null;
        }

        if(!this._table || !this._columns || this._columns.length <= 0) {
            return;
        }

        this._header = jQuery("<tr>", {"class":this._css.headerRow});
        this._columnsById = {};
        this._columnsIds = [];
        this._columnsInView = [];

        var qq, colInfo, cell;
        for(qq = 0; qq < this._columns.length; ++qq) {
            colInfo = this._columns[qq];
            if(colInfo.id) {
                this._columnsIds.push(colInfo.id);
            }
            if(!colInfo.id || this._columnsById[colInfo.id]) {
                continue;
            }

            if(colInfo.hidden) {
                this._hiddenColumns[colInfo.id] = 1;
                continue;
            } else if(colInfo.hidden !== false && this._hiddenColumns[colInfo.id]) {
                colInfo.hidden = true;
                continue;
            }
            if(this._hiddenColumns[colInfo.id]) {
                delete this._hiddenColumns[colInfo.id];
            }

            this._columnsById[colInfo.id] = colInfo;
            colInfo.title = colInfo.title || "";
            colInfo.width = colInfo.width ? this._toCssDimention(colInfo.width) : null;

            cell = jQuery("<th>", {"class":this._css.cell + " col_" + colInfo.id, "data-col":colInfo.id});
            jQuery("<span>", {"class":"name", "title":"click to sort"}).text(colInfo.title).appendTo(cell);

            if(colInfo.sort !== false) {
                jQuery("<span>", {"class":this._css.iconSort + " fa fa-sort-amount-asc"}).appendTo(cell);
            }
            if(colInfo.filter) {
                var prm = {"class":this._css.iconFilter + " fa fa-filter"};
                if(colInfo.filterTooltip) prm.title = colInfo.filterTooltip;
                jQuery("<span>", prm).appendTo(cell);
                this._columnsFilters[colInfo.id] = this._prepareFilterData(colInfo.filter);
            } else {
                this._columnsFilters[colInfo.id] = null;
            }

            if(colInfo.width) {
                cell.css("width", colInfo.width);
            }

            if(colInfo.tooltip) {
                cell.attr("title", colInfo.tooltip)
            }

            this._columnsInView.push(colInfo.id);
            cell.appendTo(this._header);
        }

        this._table.find(this._toSelector(this._css.headerRow)).remove();
        this._table.prepend(this._header);
        this._saveState("hiddenColumns");

        this._updateHeaderFilterHiLite();
        this._updateHeaderSortHiLite();
    };

    BTGrid.prototype._onHeaderClick = function(event) {
        var column = jQuery(event.target);
        if(column.hasClass(this._css.iconFilter)) {
            this._onHeaderFilterClick(event);
            return;
        }

        if(!column.hasClass(this._css.cell)) {
            column = column.closest(this._toSelector(this._css.cell));
        }

        var colId = column.attr("data-col");
        if(!this._columnsById[colId] || this._columnsById[colId].sort === false) {
            return;
        }

        if(this._sortColumn === colId) {
            this._sortOrder = this._sortOrder === 1 ? -1 : 1;
        } else {
            this._sortColumn = colId;
            this._sortOrder = 1;
        }

        this._updateHeaderSortHiLite();
        this._saveState("sort");
        this.onSortChanged(this._sortColumn, this._sortOrder);
        this._refresh();

        BTUtils.breakEvent(event);
    };

    BTGrid.prototype._onHeaderRightClick = function(event) {
        var column = jQuery(event.target);
        if(!column.hasClass(this._css.iconFilter)) {
            return true;
        }

        this._closeFilterPopup();

        if(!column.hasClass(this._css.cell)) column = column.closest(this._toSelector(this._css.cell));
        var colId = column.attr("data-col");
        if(!this._columnsById[colId] || !this._columnsById[colId].filter) return;

        if(this._filtersData[colId] && !BTUtils.isEmpty(this._filtersData[colId])) {
            this._filtersData[colId] = {};
            this._updateHeaderFilterHiLite(colId);
            this._saveState("filter");
            this.onFilterChanged();
            this._refresh();
        }

        return false;
    };

    /**
     * @param {string} [colId]
     */
    BTGrid.prototype._updateHeaderFilterHiLite = function(colId) {
        var cols = colId && this._columnsById[colId] ? [colId] : this._columnsInView;
        var qq;
        for(qq = 0; qq < cols.length; ++qq) {
            if (!this._filtersData[cols[qq]] || BTUtils.isEmpty(this._filtersData[cols[qq]])) {
                this._getHeaderCell(cols[qq]).removeClass(this._css.filter);
            } else {
                this._getHeaderCell(cols[qq]).addClass(this._css.filter);
            }
        }
    };

    BTGrid.prototype._updateHeaderSortHiLite = function() {
        this._header
            .children(this._toSelector(this._css.sort))
            .removeClass(this._css.sort)
            .removeClass(this._css.sortAsc)
            .removeClass(this._css.sortDesc);

        this._header.children(".col_" + this._sortColumn)
            .addClass(this._css.sort)
            .addClass(this._sortOrder > 0 ? this._css.sortAsc : this._css.sortDesc)
            .find(this._toSelector(this._css.iconSort))
            .removeClass(this._sortOrder > 0 ? "fa-sort-amount-desc" : "fa-sort-amount-asc")
            .addClass(this._sortOrder > 0 ? "fa-sort-amount-asc" : "fa-sort-amount-desc");
    };

    BTGrid.prototype._closeFilterPopup = function() {
        if(this._filterPopup) {
            this._filterPopup.off("click.BTGridFilterEvents");
            this._filterPopup.off("mousedown.BTGridFilterEvents");
            this._filterPopup.remove();
            this._filterPopup = null;
        }
        jQuery("body").off("mousedown.BTGridFilterEvents");
    };

    BTGrid.prototype._onHeaderFilterClick = function(event) {
        var that = this;
        BTUtils.breakEvent(event);

        this._closeFilterPopup();

        var column = jQuery(event.target);
        if(!column.hasClass(that._css.cell)) column = column.closest(that._toSelector(that._css.cell));
        var colId = column.attr("data-col");
        if(!that._columnsById[colId] || !that._columnsById[colId].filter) return;

        that._filterPopup = jQuery("<div>", {"class":that._css.filterPopup, "data-col-id":colId});
        that._filterPopup.appendTo("body");

        that._filterPopup.css({
            "left": (event.pageX - that._filterPopup.width()) + "px",
            "top": (event.pageY + 10) + "px"
        });
        that._filterPopup.moveObjectToVisibleArea();

        /**
         * @param {Object} item
         * @param {string} [itemId]
         * @private
         */
        var _addFilterItem = function(item, itemId) {
            if(!item) {
                return;
            }

            classes = that._css.filterPopupItem;
            itemId = typeof(item.id) !== "undefined" && String(item.id).length > 0 ? item.id : itemId;
            if(!that._filtersData[colId] || !that._filtersData[colId][itemId]) {
                classes += " " + that._css.checked;
            }
            var view = jQuery("<div>", {"class":classes, "data-id":itemId, "data-item-type":"check"})
                .append(jQuery("<span>", {"class":"fa fa-check"}))
                .append(jQuery("<span>").text((typeof(item) === "string" ? item : (item.title || item.name || item.value)) || "(empty)"));
            if(item.css) {
                view.css(item.css);
            }
            view.appendTo(that._filterPopup);
        };

        var _onItemClick = function(event) {
            var obj = jQuery(event.target).getClosest(that._toSelector(that._css.filterPopupItem));
            if(obj.attr("data-item-type") !== "check") {
                return;
            }

            var colId = obj.closest(that._toSelector(that._css.filterPopup)).attr("data-col-id");
            var itemId = obj.attr("data-id");

            if(typeof(that._filtersData[colId]) === "undefined") {
                that._filtersData[colId] = {};
            }

            if(obj.hasClass(that._css.checked)) {
                obj.removeClass(that._css.checked);
                that._filtersData[colId][itemId] = itemId;
            } else {
                obj.addClass(that._css.checked);
                if(typeof(that._filtersData[colId][itemId]) !== "undefined") {
                    delete that._filtersData[colId][itemId];
                }
            }

            that._updateHeaderFilterHiLite(colId);
            that._saveState("filter");
            that.onFilterChanged();
            that._refresh();
        };

        var _onFilterDataChanged = function(event) {
            var obj = jQuery(event.target);
            var listItem = obj.hasClass(that._css.filterPopupItem) ? obj : obj.closest(that._toSelector(that._css.filterPopupItem));
            var colId = listItem.closest(that._toSelector(that._css.filterPopup)).attr("data-col-id");
            var newValue = null;
            var dataItemType = listItem.attr("data-item-type");

            if(typeof(that._filtersData[colId]) === "undefined") {
                that._filtersData[colId] = {};
            }

            if(dataItemType === "text") {
                newValue = obj.getValue();

                if(newValue) {
                    that._filtersData[colId]["_value"] = newValue;
                } else {
                    if(typeof(that._filtersData[colId]["_value"]) !== "undefined") {
                        delete that._filtersData[colId]["_value"];
                    }
                }
            } else if(dataItemType === "min") {
                newValue = obj.getValue();

                if(newValue) {
                    that._filtersData[colId]["_min"] = newValue;
                    listItem.addClass(that._css.checked);
                } else {
                    if(typeof(that._filtersData[colId]["_min"]) !== "undefined") {
                        delete that._filtersData[colId]["_min"];
                    }
                    listItem.removeClass(that._css.checked);
                }
            } else if(dataItemType === "max") {
                newValue = obj.getValue();

                if(newValue) {
                    that._filtersData[colId]["_max"] = newValue;
                    listItem.addClass(that._css.checked);
                } else {
                    if(typeof(that._filtersData[colId]["_max"]) !== "undefined") {
                        delete that._filtersData[colId]["_max"];
                    }
                    listItem.removeClass(that._css.checked);
                }
            } else if(dataItemType === "equal") {
                newValue = obj.getValue();

                if(newValue) {
                    that._filtersData[colId]["_equal"] = newValue;
                    listItem.addClass(that._css.checked);
                } else {
                    if(typeof(that._filtersData[colId]["_equal"]) !== "undefined") {
                        delete that._filtersData[colId]["_equal"];
                    }
                    listItem.removeClass(that._css.checked);
                }
            } else if(dataItemType === "start-date") {
                newValue = obj.getValue();

                if(newValue) {
                    that._filtersData[colId]["_start_date"] = ToDate(newValue).setHours(0,0,0,0);
                    listItem.addClass(that._css.checked);
                } else {
                    if(typeof(that._filtersData[colId]["_start_date"]) !== "undefined") {
                        delete that._filtersData[colId]["_start_date"];
                    }
                    listItem.removeClass(that._css.checked);
                }
            } else if(dataItemType === "end-date") {
                newValue = obj.getValue();

                if(newValue) {
                    that._filtersData[colId]["_end_date"] = ToDate(newValue).setHours(23,59,59,999);
                    listItem.addClass(that._css.checked);
                } else {
                    if(typeof(that._filtersData[colId]["_end_date"]) !== "undefined") {
                        delete that._filtersData[colId]["_end_date"];
                    }
                    listItem.removeClass(that._css.checked);
                }
            }

            BTUtils.setSingleTimeout("gtGrid_refresh", function() {
                that._updateHeaderFilterHiLite(colId);
                that._saveState("filter");
                that.onFilterChanged();
                that._refresh();
            }, 250);
        };

        var _onPopupMouseDown = function(event) {
            BTUtils.stopEvent(event);
        };

        var qq, keys, filterItems, classes;
        if(that._columnsFilters[colId]) {
            if(that._columnsFilters[colId].type === "list") {
                keys = Object.keys(that._columnsFilters[colId].data);
                filterItems = that._columnsFilters[colId].data;
                for(qq = 0; qq < keys.length; ++qq) {
                    _addFilterItem(filterItems[keys[qq]]);
                }
            } else if(that._columnsFilters[colId].type === "text") {
                jQuery("<input>", {"class": that._css.filterPopupItem, "data-item-type": "text"})
                    .setValue(that._filtersData[colId] && that._filtersData[colId]["_value"] ? that._filtersData[colId]["_value"] : "")
                    .appendTo(that._filterPopup);
                that._filterPopup.find("input").eq(0).focus();
            } else if(that._columnsFilters[colId].type === "number") {
                jQuery("<div>", {"class": that._css.filterPopupItem, "data-item-type": "min"})
                    .append(jQuery("<span>").html("&gt;"))
                    .append(jQuery("<input>", {"type": "number"}).setValue(that._filtersData[colId] && that._filtersData[colId]["_min"] ? that._filtersData[colId]["_min"] : ""))
                    .appendTo(that._filterPopup);
                jQuery("<div>", {"class": that._css.filterPopupItem, "data-item-type": "equal"})
                    .append(jQuery("<span>").html("="))
                    .append(jQuery("<input>", {"type": "number"}).setValue(that._filtersData[colId] && that._filtersData[colId]["_equal"] ? that._filtersData[colId]["_equal"] : ""))
                    .appendTo(that._filterPopup);
                jQuery("<div>", {"class": that._css.filterPopupItem, "data-item-type": "max"})
                    .append(jQuery("<span>").html("&lt;"))
                    .append(jQuery("<input>", {"type": "number"}).setValue(that._filtersData[colId] && that._filtersData[colId]["_max"] ? that._filtersData[colId]["_max"] : ""))
                    .appendTo(that._filterPopup);
                that._filterPopup.find("input").eq(1).focus();
            } else if(that._columnsFilters[colId].type === "datetime") {
                jQuery("<div>", {"class": that._css.filterPopupItem, "data-item-type": "start-date"})
                    .append(jQuery("<span>").html("&gt;"))
                    .append(jQuery("<input>", {"type": "date"}).setValue(that._filtersData[colId] && that._filtersData[colId]["_start_date"] ? ToDate(that._filtersData[colId]["_start_date"]).toSQLDate() : ""))
                    .appendTo(that._filterPopup);
                jQuery("<div>", {"class": that._css.filterPopupItem, "data-item-type": "end-date"})
                    .append(jQuery("<span>").html("&lt;"))
                    .append(jQuery("<input>", {"type": "date"}).setValue(that._filtersData[colId] && that._filtersData[colId]["_end_date"] ? ToDate(that._filtersData[colId]["_end_date"]).toSQLDate() : ""))
                    .appendTo(that._filterPopup);
                that._filterPopup.find("input").eq(1).focus();
            }
        }

        var oBody = jQuery("body");
        oBody.on("mousedown.BTGridFilterEvents", this._closeFilterPopup._bind(this));
        that._filterPopup.on("mousedown.BTGridFilterEvents", _onPopupMouseDown);
        that._filterPopup.on("click.BTGridFilterEvents", that._toSelector(that._css.filterPopupItem), _onItemClick);
        that._filterPopup.on("input.BTGridFilterEvents", _onFilterDataChanged);
    };

    BTGrid.prototype._formatCellValue = function(colId, colInfo, item) {
        var dd, text = "";
        if(typeof(colInfo.draw) === "function") {
            text = colInfo.draw(item, colId);
        } else if(this._columnsFilters[colId]) {
            if(this._columnsFilters[colId].type === "list") {
                if(BTUtils.isDef(item[colId]) && this._columnsFilters[colId].data[item[colId]]) {
                    dd = this._columnsFilters[colId].data[item[colId]];
                    text = dd.value;
                    if(dd.css) {
                        text = '<span style="' + BTGrid.makeStyle(dd.css) + '">' + text + '</span>';
                    }
                }
            } else if(this._columnsFilters[colId].type === "date") {
                text = BTUtils.isDef(item[colId]) && (dd = ToDate(item[colId])) !== null ? BTDate.format(dd, this._columnsFilters[colId].format) : "";
            } else {
                text = item[colId] || "";
            }
        } else {
            text = item[colId] || "";
        }
        return text;
    };

    /**
     * @param {int} itemId
     * @returns {jQuery}
     * @private
     */
    BTGrid.prototype._addItemInfo = function(itemId) {
        var item = this._items[itemId];
        if(!item || !this._rowByItemId[item.id]) {
            return jQuery();
        }

        var row = jQuery("<tr>", {"class":this._css.row_item_info, "data-id":item.id});
        var cell = jQuery("<td>", {"colspan":this._columnsInView.length}).appendTo(row);
        this._rowInfoByItemId[item.id] = row;
        row.insertAfter(this._rowByItemId[item.id]);

        return cell;
    };

    /**
     * @param {Object} item
     * @returns {jQuery}
     * @private
     */
    BTGrid.prototype._createRowItem = function(item) {
        var row = jQuery("<tr>", {"class":this._css.row, "data-id":item.id});

        var qq, colId, colInfo, cell, text;
        for(qq = 0; qq < this._columnsInView.length; ++qq) {
            colId = this._columnsInView[qq];
            colInfo = this._columnsById[colId];

            text = this._formatCellValue(colId, colInfo, item);
            cell = jQuery("<td>", {"class":this._css.cell + " col_" + colId, "data-col-id":colId }).html(text);

            if(BTUtils.isDef(colInfo.width)) {
                cell.css("width", colInfo.width);
            }

            if(BTUtils.isDef(colInfo.align)) {
                cell.css("text-align", colInfo.align);
            }

            if(BTUtils.isDef(colInfo.css)) {
                cell.css(colInfo.css);
            }

            if(BTUtils.isDef(item.$css)) {
                cell.css(item.$css);
            }

            cell.appendTo(row);
        }
        return row;
    };

    /**
     * @param {Object} item
     * @param {jQuery} view
     * @returns {jQuery}
     * @private
     */
    BTGrid.prototype._updateRowItem = function(item, view) {
        var qq, colId, colInfo, text;
        var cells = view.children();
        for(qq = 0; qq < this._columnsInView.length; ++qq) {
            colId = this._columnsInView[qq];
            colInfo = this._columnsById[colId];

            text = this._formatCellValue(colId, colInfo, item);
            cells.eq(qq).html(text);
        }
        return view
    };

    /**
     * update item row's view,
     * without append it to DOM
     * @param {int} itemId
     * @returns {jQuery|null}
     * @private
     */
    BTGrid.prototype._updateItem = function(itemId) {
        var item = this._items[itemId];
        if(!item) return null;

        var view = this._rowByItemId[itemId];
        if(!view) {
            view = this._createRowItem(item);
            this._rowByItemId[itemId] = view;
        } else {
            view = this._updateRowItem(item, view);
        }

        return view;
    };

    /**
     * refresh items view and position in grid
     */
    BTGrid.prototype._refresh = function() {
        var that = this;
        var recList = Object.keys(this._items);
        recList = recList.filter(function(itemId){ return that.isRecordVisible(that._items[itemId], that); });
        if(that._sortColumn) {
            recList.sort(function(a,b) { return that.sortFunction(that._items[a], that._items[b], that._sortColumn, that._sortOrder); });
        }

        var qq, obj, prevView = null;
        for(qq = 0; qq < recList.length; ++qq) {
            obj = this._updateItem(recList[qq]);
            if(obj === null) continue;

            // insert or move row
            if(!prevView) {
                obj.appendTo(this._table);
            } else {
                obj.insertAfter(prevView);
            }

            // save as last added row
            prevView = obj;

            // move additional row info
            var recData = this._rowInfoByItemId[recList[qq]];
            if(recData && recData.length > 0) {
                recData.insertAfter(prevView);
                prevView = recData;
            }
        }

        // prepare list of rows to remove
        BTUtils.each(this._items, function(item, recId) {
            if(recList.indexOf(recId) >= 0) {
                return;
            }

            if(that._rowByItemId[recId]) {
                that._rowByItemId[recId].remove();
                that._rowByItemId[recId] = null;
                delete that._rowByItemId[recId];
            }

            if(that._rowInfoByItemId[recId]) {
                that._rowInfoByItemId[recId].remove();
                that._rowInfoByItemId[recId] = null;
                delete that._rowInfoByItemId[recId];
            }
        });
    };

    BTGrid.prototype._saveState = function(type) {
        if(!this._autoSaveState || !this._gridName) {
            return;
        }

        if(type === "sort") {
            window.localStorage["btGrid_state_" + this._gridName + "_sort"] = JSON.stringify({
                sortColumn: this._sortColumn,
                sortOrder: this._sortOrder
            });
        } else if(type === "filter") {
            window.localStorage["btGrid_state_" + this._gridName + "_filter"] = this._filtersData ? JSON.stringify(this._filtersData) : "{}";
        } else if(type === "hiddenColumns") {
            window.localStorage["btGrid_state_" + this._gridName + "_hiddenColumns"] = this._hiddenColumns ? JSON.stringify(this._hiddenColumns) : "{}";

        }
    };

    BTGrid.prototype._loadState = function() {
        if(!this._autoSaveState || !this._gridName) {
            return;
        }

        var data;

        if(window.localStorage["btGrid_state_" + this._gridName + "_sort"]) {
            try { data = JSON.parse(window.localStorage["btGrid_state_" + this._gridName + "_sort"]); } catch(e) { data = {}; }
            if(data.sortColumn) this._sortColumn = data.sortColumn;
            if(data.sortOrder) this._sortOrder = data.sortOrder;
        }

        if(window.localStorage["btGrid_state_" + this._gridName + "_filter"]) {
            try { data = JSON.parse(window.localStorage["btGrid_state_" + this._gridName + "_filter"]); } catch(e) { data = {}; }
            this._filtersData = data ? data : {};
        }

        if(window.localStorage["btGrid_state_" + this._gridName + "_hiddenColumns"]) {
            try { data = JSON.parse(window.localStorage["btGrid_state_" + this._gridName + "_hiddenColumns"]); } catch(e) { data = {}; }
            this._hiddenColumns = data ? data : {};
        }
    };

    BTGrid.prototype._onRecordClick = function(event) {
        var obj = jQuery(event.target);
        var cell = obj.closest(this._toSelector(this._css.cell));
        var row = cell.closest(this._toSelector(this._css.row));
        var rowId = row.attrAsId("data-id");
        var colId = cell.attr("data-col-id");
        if(this.onRecordClick(event, rowId, colId) !== true) {
            BTUtils.stopEvent(event);
            return false;
        }
        return true;
    };

    // TODO commercial version
    BTGrid.prototype._onRecordRightClick = function(event) {
        var obj = jQuery(event.target);
        var cell = obj.closest(this._toSelector(this._css.cell));
        var row = cell.closest(this._toSelector(this._css.row));
        var rowId = row.attrAsId("data-id");
        var colId = cell.attr("data-col-id");
        if(this.onRecordRightClick(event, rowId, colId) !== true) {
            BTUtils.stopEvent(event);
            return false;
        }
        return true;
    };
    // TODO end commercial version

    BTGrid.prototype.filterItem = function(item, colId) {
        if(!item) return false;
        if(!colId || !this._filtersData[colId]) { return true; }
        if(BTUtils.isDef(this._filtersData[colId]["_value"])) {
            return (String(item[colId]).toLowerCase().indexOf(this._filtersData[colId]["_value"].toLowerCase()) >= 0);
        }
        if(BTUtils.isDef(this._filtersData[colId]["_equal"]) || BTUtils.isDef(this._filtersData[colId]["_min"]) || BTUtils.isDef(this._filtersData[colId]["_max"])) {
            if(BTUtils.isDef(this._filtersData[colId]["_equal"]) && item[colId] === this._filtersData[colId]["_equal"]) {
                return true;
            }
            if(BTUtils.isDef(this._filtersData[colId]["_min"]) && item[colId] < this._filtersData[colId]["_min"]) {
                return false;
            }
            if(BTUtils.isDef(this._filtersData[colId]["_max"]) && item[colId] > this._filtersData[colId]["_max"]) {
                return false;
            }
            return !BTUtils.isDef(this._filtersData[colId]["_equal"]);
        }
        if(BTUtils.isDef(this._filtersData[colId]["_start_date"]) || BTUtils.isDef(this._filtersData[colId]["_end_date"])) {
            return !(
                (BTUtils.isDef(this._filtersData[colId]["_start_date"]) && ToDate(item[colId]).setHours(0,0,0,0) < this._filtersData[colId]["_start_date"])
                || (BTUtils.isDef(this._filtersData[colId]["_end_date"]) && ToDate(item[colId]).setHours(0,0,0,0) > this._filtersData[colId]["_end_date"])
            );
        }
        return !this._filtersData[colId][item[colId]];
    };

    BTGrid.makeStyle = function(obj) {
        var res = "";
        BTUtils.each(obj, function(v, k) { res += k + ":" + v + ";"; });
        return res;
    };

    /********************************************************************************
     * callbacks
     ********************************************************************************/

    /**
     * compare two records by requested column
     * @param {Object} rec1
     * @param {Object} rec2
     * @param {string} columnId
     * @param {int} direction -- should be more or less then zero (> 0, < 0)
     * @returns {number}
     */
    BTGrid.prototype.sortFunction = function(rec1, rec2, columnId, direction) {
        var colInfo = this._columnsById[columnId];
        var v1 = this._formatCellValue(columnId, colInfo, rec1);
        var v2 = this._formatCellValue(columnId, colInfo, rec2);
        return (v1 > v2 ? 1 : (v1 < v2 ? -1 : 0)) * (direction > 0 ? 1 : -1);
    };

    /**
     * called when sorting was changed
     * @param {string} columnId
     * @param {int} direction -- should be more or less then zero (> 0, < 0)
     */
    BTGrid.prototype.onSortChanged = function(columnId, direction) {};

    /**
     * called when user's made changes in filtering
     */
    BTGrid.prototype.onFilterChanged = function() {};

    /**
     * called for checking is record vivible
     * @param {Object} item
     * @param {BTGrid} grid
     * @returns {boolean}
     */
    BTGrid.prototype.isRecordVisible = function(item, grid) {
        var qq;
        for(qq = 0; qq < this._columns.length; ++qq) {
            if(!this._filtersData[this._columns[qq].id]) {
                continue;
            }

            if(!grid.filterItem(item, this._columns[qq].id)) {
                return false;
            }
        }

        return true;
    };

    /**
     * called when user click to row
     * @param {jQuery.Event} event
     * @param {int} itemId
     * @param {int} colId
     * @returns {boolean}
     */
    BTGrid.prototype.onRecordClick = function(event, itemId, colId) {};
    BTGrid.prototype.onRecordEditFinished = function(itemId, colId, newValue) {};

    // TODO commercial version
    /**
     * called when user do right click on row
     * @param event
     * @param itemId
     * @param colId
     */
    BTGrid.prototype.onRecordRightClick = function(event, itemId, colId) {};
    // TODO end commercial version

    window.BTGrid = BTGrid;
})();
