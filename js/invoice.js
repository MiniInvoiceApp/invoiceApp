(function () {
    "use strict";

    //Initialize gsGrid
    let jsGridOptions = {
        autoload: true,
        controller: {
            loadData: loadData,
            updateItem: updateData,
            deleteItem: deleteData
        },
        width: "100%",
        height: "auto",
        heading: true,
        filtering: false,
        inserting: false,
        editing: true,
        selecting: true,
        sorting: false,
        paging: true,
        pageLoading: true,
        //Retrieve data (invoice items) when we click on a row
        rowClick: function (args) {
            $.ajax({
                type: "GET",
                url: Constants.BASE_PATH + "invoice-item?id=" + args.item.id
            }).then(function (response) {
                let invoiceModal = document.getElementById("invoiceItemsModal");
                let modalBody = document.querySelector("#invoiceItemsModal .modal-body");
                let test = "<table class='table'>";
                test += "<thead><tr><th scope='col'>Name</th><th scope='col'>Amount</th></tr></thead><tbody>";
                response.forEach(function (value, index) {
                    test += "<tr><td>" + value.name + "</td><td>" + value.amount + "</td></tr>";
                });
                test += "</tbody></table>";

                modalBody.innerHTML = test;
                $(invoiceModal).modal('show');
            })
        },
        pageIndex: 1,
        pageSize: 5,
        pageButtonCount: 15,
        pagerFormat: "{first} {prev} {pages} {next} {last} &nbsp;&nbsp; Page: {pageIndex} of {pageCount}",
        pagePrevText: "&lt",
        pageNextText: "&gt",
        pageFirstText: "&laquo;",
        pageLastText: "&raquo;",
        pageNavigatorNextText: "...",
        pageNavigatorPrevText: "...",
    };
    jsGridOptions.fields = [
        {name: "id", title: "Id", type: "text", width: 50, editing: false},
        {name: "client", title: "Client", type: "text", width: 200, editing: false},
        {name: "invoice_amount", title: "Invoice Amount", type: "number", editing: false},
        {name: "vat_rate", title: "Vat Rate", type: "number", editing: false},
        {name: "invoice_amount_plus_vat", title: "Invoice Plus VAT", type: "number", editing: false},
        {
            name: "invoice_status",
            title: "Invoice Status",
            type: "select",
            items: Constants.INVOICE_STATUSES,
            valueField: "name",
            textField: "name"
        },
        {name: "invoice_date", title: "Invoice Date", type: "text", editing: false},
        {type: "control"}
    ];

    /**
     * Retrieve data to show
     *
     * @param filter
     * @returns {PromiseLike<{data: *, itemsCount: *}> | Promise<{data: *, itemsCount: *}> | *}
     */
    function loadData(filter) {
        let limit = (filter.pageIndex - 1) * filter.pageSize;
        let offset = filter.pageSize;
        return $.ajax({
            type: "GET",
            url: Constants.BASE_PATH + "invoice?limit=" + limit + "&offset=" + offset
        }).then(function (response) {
            return {data: response.data, itemsCount: response.totalDataCount}
        });
    }

    /**
     * Partial update a row
     *
     * @param item
     */
    function updateData(item) {
        let patchData = {};
        patchData.invoice_status = item.invoice_status;
        $.ajax({
            type: "PATCH",
            url: Constants.BASE_PATH + "invoice/" + item.id,
            data: JSON.stringify(patchData),
        }).then(function () {
            return item;
        });
    }

    /**
     * Delete a row
     *
     * @param item
     */
    function deleteData(item) {
        $.ajax({
            type: "DELETE",
            url: Constants.BASE_PATH + "invoice/" + item.id
        }).then(function () {
            return item;
        });
    }

    let modalOptions = {
        backdrop: true,
        keyboard: true,
        focus: true,
        show: false
    };

    $("#jsGrid").jsGrid(jsGridOptions);
    $("#invoiceItemsModal").modal(modalOptions);

    $('a[data-toggle="tab"]').on('shown.bs.tab', function () {
        $("#jsGrid").jsGrid("loadData");
    })
})();