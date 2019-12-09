'use strict';

/**
 * Download csv file
 *
 * @param file
 */
function downloadCsv(file) {
    document.location.href = Constants.BASE_PATH + "csv-export?csv=" + file;
}