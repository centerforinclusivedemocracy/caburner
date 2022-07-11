$(document).ready(function () {
    initStatewideMap();
});


let MAP;

function initStatewideMap () {
    // the map, a fixed basemap, a labels overlay, and our special map controls
    // note the ZoomBar which we add after we have GeoJSON data and therefore a home extent
    MAP = L.map('statemap', {
        zoomControl: false,
        maxZoom: 18,
        minZoom: 6,
    });

    L.control.scale({
        position: 'bottomleft',
        updateWhenIdle: true
    })
    .addTo(MAP);

    MAP.BASEMAPBAR = new L.Control.BasemapBar({
        position: 'topright',
        layers: BASEMAP_OPTIONS,
    })
    .addTo(MAP)
    .selectLayer(BASEMAP_OPTIONS[0].label);

    // a Select2-based typeahead "select" for picking a county
    const select2countyoptions = COMPLETED_COUNTIES.map(function (countyinfo) {
        return { id: countyinfo.countyfp, text: countyinfo.name };
    });
    new L.Control.CountyPicker({
        position: 'topleft',
        counties: select2countyoptions,
    }).addTo(MAP);

    // load the GeoJSON of county boundaries, add to the map, with a mouseover effect based on the county being in PARTICIPATING_COUNTIES
    new L.Control.StatewideMapLegend({
    }).addTo(MAP);

    $.get('data/counties.json', function (data) {
        MAP.COUNTYOVERLAY = L.geoJson(data, {
            style: function (feature) {
                let countyinfo;
                try {
                    countyinfo = getParticipatingCountyInfo(feature.properties.countyfp);
                } catch (error) {}  // catch = leave undefined, it's OK

                if (! countyinfo) return BOUNDSTYLE_DEFAULT;  // not participating, default style

                switch (countyinfo.profile) {
                    case 'fullmodel':
                        return BOUNDSTYLE_FULL;
                    case 'lite':
                        return BOUNDSTYLE_LITE;
                    case 'vca':
                        return BOUNDSTYLE_VCA;
                    case 'nonvca':
                        return BOUNDSTYLE_NONVCA;
                    case 'vbm':
                        return BOUNDSTYLE_VBM;
                    case 'butte':
                        return BOUNDSTYLE_BUTTE;
                    case 'blackvoter':
                        return BOUNDSTYLE_VCA;
                    // case 'inprogress':
                    //     return BOUNDSTYLE_INPROGRESS;
                    default:
                        // console.error(`County ${countyinfo.countyfp} has unknown profile '${countyinfo.profile}' for styling map`);
                        return BOUNDSTYLE_DEFAULT;  // not known, so punt with this and the error message
                }
            },
            onEachFeature: function (feature, layer) {
                // tooltip = the county name and invitation to click
                let countyinfo;
                try {
                    countyinfo = getParticipatingCountyInfo(feature.properties.countyfp);
                } catch (error) {}  // catch = leave undefined, it's OK


                let message = 'Modeling Update in Progress';
                if (countyinfo) {
                    switch (countyinfo.profile) {
                        case 'fullmodel':
                            message = 'Suggested Voting Locations';
                            break;
                        case 'lite':
                            message = 'Community-Level Demographic and Voter Data';
                            break;
                        case 'vca':
                            message = "Voter's Choice Act County";
                            break;
                        case 'nonvca':
                            message = "Polling Place County";
                            break;
                        case 'vbm':
                            message = "Vote By Mail Only County";
                            break;
                        case 'butte':
                            message = "No Location Modeling Due to Recent Population Changes";
                            break;
                        case 'blackvoter':
                            message = "Voter's Choice Act County";
                            break;
                        // case 'inprogress':
                        //     message = 'Modeling Update in Progress';
                        //     break;
                        // default:
                        //     console.error(`County ${countyinfo.countyfp} has unknown profile '${countyinfo.profile}' for creating tooltip`);
                        //     message = 'Unknown status';
                        //     break;
                    }
                }

                const popupcontent = `<h1>${feature.properties.name}</h1>${message}`;

                layer.bindTooltip(popupcontent, { sticky: true });

                // click = go to the page
                if (countyinfo) {
                    const url = `county.html?county=${feature.properties.countyfp}`;
                    layer.on('click', function () { document.location.href = url; });
                }
            },
        })
        .addTo(MAP);

        const bbox = MAP.COUNTYOVERLAY.getBounds();
        MAP.fitBounds(bbox);

        // now that we have a home bounds, add the zoom+home control then the geocoder control under it (they are positioned in sequence)
        MAP.ZOOMBAR = new L.Control.ZoomBar({
            position: 'topright',
            homeBounds: bbox,
        }).addTo(MAP);

        MAP.GEOCODER = L.Control.geocoder({
            position: 'topright',
            showUniqueResult: false,
            defaultMarkGeocode: false,
            placeholder: 'Search for address or place',
            collapsed: true,  // control is buggy if expanded, won't close results list
        })
        .on('markgeocode', function (event) {
            MAP.fitBounds(event.geocode.bbox);
        })
        .addTo(MAP);
    }, 'json');
}
