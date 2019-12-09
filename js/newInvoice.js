(function () {
    'use strict';

    let invoiceItemsSelect = document.getElementsByClassName("invoiceItems");
    populateInvoiceItems(invoiceItemsSelect[0]);

    let $statusSelect = document.getElementById("status");
    Constants.INVOICE_STATUSES.forEach(function (value, index) {
        let option = document.createElement("option");
        option.value = value.name;
        option.innerHTML = value.name;
        $statusSelect.appendChild(option);
    });

    /**
     * Add options on InvoiceSelectItems
     * Makes sure that all InvoiceSelectItems can be selected only once
     *
     * @param select
     */
    function populateInvoiceItems(select) {
        let usedInvoiceItems = document.getElementsByClassName("invoiceItems");

        if (usedInvoiceItems.length === Constants.SERVICES.length) {
            let addButton = document.getElementById('addInvoiceItem');
            addButton.setAttribute('disabled', 'true');
        }

        let blacklistOptions = [];

        Array.from(usedInvoiceItems).forEach(function (element) {
            blacklistOptions.push(element.value);
        });

        Constants.SERVICES.forEach(function (value) {
            if (!blacklistOptions.includes(value.name)) {
                let option = document.createElement("option");
                option.value = value.name;
                option.innerHTML = value.name;
                select.appendChild(option);
            }
        });

        select.addEventListener('change', function () {
            updateSelectInvoiceItems();
        });

        updateSelectInvoiceItems();
    }

    /**
     * Updates select invoice options so each one can be selected only once
     */
    function updateSelectInvoiceItems() {
        let blacklistOptions = [];
        let usedInvoiceItems = document.getElementsByClassName("invoiceItems");

        Array.from(usedInvoiceItems).forEach(function (element) {
            blacklistOptions.push(element.value);
        });

        Array.from(usedInvoiceItems).forEach(function (element) {
            for (let i = 0; i < element.length; i++) {
                let value = element.options[i].value;
                if (blacklistOptions.includes(value) && value !== element.value) {
                    element.remove(i);
                }
            }

            Constants.SERVICES.forEach(function (service) {
                if (!blacklistOptions.includes(service.name) && !selectIncludes(element, service.name)) {
                    let option = document.createElement("option");
                    option.value = service.name;
                    option.innerHTML = service.name;
                    element.appendChild(option);
                }
            });
        });
    }

    /**
     * Search in a select element if an option exists
     *
     * @param selectElement
     * @param optionValue
     * @returns {boolean}
     */
    function selectIncludes(selectElement, optionValue) {
        for (let i = 0; i < selectElement.length; i++) {
            let value = selectElement.options[i].value;
            if (value === optionValue) {
                return true;
            }
        }
        return false;
    }

    /**
     * Add a new Invoice Item (Invoice Item select box and Invoice Amount)
     */
    $("#addInvoiceItem").click(function () {
        let newInvoiceItem = "<div class='form-row invoiceItemsFields mt-2'>" +
            "<div class='col-md-6'>" +
            "<select class='form-control invoiceItems'></select>" +
            "</div><div class='col-md-6'>" +
            "<input type='number' class='form-control amount' id='amount' placeholder='1.00' step='any' min='0' required>" +
            "</div></div>";

        $('#invoiceItemsFields').append(newInvoiceItem);
        let invoiceItemsSelect = document.getElementsByClassName("invoiceItems");
        const invoiceItemsCount = invoiceItemsSelect.length;
        populateInvoiceItems(invoiceItemsSelect[invoiceItemsCount - 1]);
    });

    $("#submit").click(function (event) {
        event.preventDefault();

        let errors = [];

        let client = $("#client").val();
        let vatRateValue = $("#vatRate").val();
        let vatRate = parseFloat(vatRateValue);
        let status = $("#status").val();

        let invoiceItems = [];
        let invoiceItemNames = document.getElementsByClassName("invoiceItems");
        let invoiceItemAmounts = document.getElementsByClassName("amount");
        Array.from(invoiceItemNames).forEach(function (element, index) {
            if (invoiceItemAmounts[index].value === '') {
                errors.push("Invoice Amount " + (index + 1) + " is required and must be numeric");
            }

            let invoiceItem = {};
            invoiceItem.name = element.value;
            invoiceItem.amount = parseFloat(invoiceItemAmounts[index].value);
            invoiceItems.push(invoiceItem);
        });

        if (client === '') {
            errors.push("Client is required");
        }
        if (vatRateValue === '') {
            errors.push("Vat rate is required and must be numeric");
        }

        let failAlertBox = document.getElementById("failAlert");
        if (errors.length === 0) {
            let data = {};
            data.client = client;
            data.vatRate = vatRate;
            data.status = status;
            data.invoiceItems = invoiceItems;
console.log(data);
            $.ajax({
                type: "POST",
                url: Constants.BASE_PATH + "invoice",
                data: JSON.stringify(data)
            }).then(function (response) {
                let successAlertBox = document.getElementById("successAlert");
                successAlertBox.innerHTML = response.message;
                successAlertBox.style.display = "block";
                document.getElementById("newInvoiceForm").reset();

                setTimeout(function () {
                    $('.nav-tabs a[href="#nav-invoices"]').tab('show');
                }, 2000);
            }, function (response) {
                console.log(response);
                let errorStr = "";
                response.responseJSON.errors.forEach(function (error) {
                    errorStr += error + '<br>';
                });
                failAlertBox.innerHTML = errorStr;
                failAlertBox.style.display = "block";
            });
        } else {
            let errorStr = "";
            errors.forEach(function (error) {
                errorStr += error + '<br>';
            });
            failAlertBox.innerHTML = errorStr;
            failAlertBox.style.display = "block";
        }
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function () {
        let successAlertBox = document.getElementById("successAlert");
        let failAlertBox = document.getElementById("failAlert");
        document.getElementById("newInvoiceForm").reset();
        successAlertBox.style.display = "none";
        failAlertBox.style.display = "none";
    })
})();