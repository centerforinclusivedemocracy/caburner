$(document).ready(function () {
    initFillScopeLists();
});


function initFillScopeLists () {
    // fill in the two Scope sections, which counties use which model
    const $listing_full = $('#fullAnalysisCountyList');
    const $listing_lite = $('#liteAnalysisCountyList');
    const $listing_vca = $('#vcaCountyList');
    const $listing_nonvca = $('#nonvcaCountyList');
    const $listing_vbm = $('#vbmCountyList');
    const $listing_butte = $('#butteCountyList');

    PARTICIPATING_COUNTIES.forEach(function (countyinfo) {
        let $targetlist;
        switch (countyinfo.profile) {
            case 'fullmodel':
                $targetlist = $listing_full;
                break;
            case 'lite':
                $targetlist = $listing_lite;
                break;
            case 'vca':
                $targetlist = $listing_vca;
                break;
            case 'nonvca':
                $targetlist = $listing_nonvca;
                break;
            case 'vbm':
                $targetlist = $listing_vbm;
                break;
            case 'butte':
                $targetlist = $listing_butte;
                break;
            case 'blackvoter':
                $targetlist = $listing_vca;
                break;
            default:
                console.error(`County ${countyinfo.countyfp} has unknown profile '${countyinfo.profile}' for Scope list`);
                break;
        }

        if ($targetlist) {
            $(`<li>${countyinfo.name}</li>`).appendTo($targetlist);
        }
    });
}
