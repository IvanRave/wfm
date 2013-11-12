define(['jquery', 'knockout', 'app/datacontext', 'bootstrap-modal', 'app/app-helper', 'app/models/WellFieldMapArea', 'app/models/WellInWellFieldMap'],
    function ($, ko, datacontext, bootstrapModal, appHelper) {
        'use strict';

        function importWellFieldMapAreasDto(items, parent) {
            return $.map(items || [],
                function (itemData) {
                    return datacontext.createWellFieldMapArea(itemData, parent);
                });
        }

        function importWellInWellFieldMapsDto(items, parent) {
            return $.map(items || [],
                function (itemData) {
                    return datacontext.createWellInWellFieldMap(itemData, parent);
                });
        }

        function WellFieldMap(data, wellField) {
            var self = this;
            data = data || {};

            self.getWellField = function () {
                return wellField;
            };

            self.Id = data.Id;
            self.Name = ko.observable(data.Name);
            self.Description = ko.observable(data.Description);
            //// '{{conf.requrl}}/api/wellfieldmap?img_url=' + data.ImgUrl;
            self.ImgUrl = data.ImgUrl;

            self.fullImgUrl = datacontext.getWellFieldMapUrl({ img_url: self.ImgUrl });

            self.ScaleCoefficient = ko.observable(data.ScaleCoefficient);
            self.WellFieldId = data.WellFieldId;
            self.Width = data.Width;
            self.Height = data.Height;

            // coef width to height
            self.coefWH = data.Width / data.Height;

            self.WellFieldMapAreas = ko.observableArray();

            self.WellInWellFieldMaps = ko.observableArray();

            function initYandexMap(wellFieldMapItem, wellFieldItem) {
                ////if (myMap) { myMap.destroy(); }

                var imgWidth = wellFieldMapItem.Width;
                var imgHeight = wellFieldMapItem.Height;

                var myProjection = new ymaps.projection.Cartesian([
                                [0, 0], // left bottom
                                [256, 256]  // right top
                ], [false, false], wellFieldMapItem.ScaleCoefficient());

                var WellMapLayer = function () {
                    return new ymaps.Layer(
                    // Зададим функцию, преобразующую номер тайла и уровень масштабировая в URL до тайла на нашем хостинге
                        function (tile, zoom) {
                            var maxSide = imgWidth > imgHeight ? imgWidth : imgHeight;

                            var n = maxSide / (Math.pow(2, zoom));

                            var x1 = tile[0] * n;
                            if (x1 >= imgWidth) { return ''; }

                            var y1 = tile[1] * n;
                            if (y1 >= imgHeight) { return ''; }

                            var x2 = tile[0] * n + n;
                            if (x2 >= imgWidth) { x2 = imgWidth; }

                            var y2 = tile[1] * n + n;
                            if (y2 >= imgHeight) { y2 = imgHeight; }

                            ////var cropCoords = [x1, y1, x2, y2];
                            ////return '{{conf.requrl}}/api/wellfile/?well_id=80&purpose=history&status=work&file_name=fid20130213003420656_Map2560x1600.jpg&crop=(' + cropCoords.join(',') + ')&map_size=250'
                            ////return 'imgUrl + '&crop=(' + cropCoords.join(',') + ')';
                            return wellFieldMapItem.fullImgUrl + '&x1=' + x1 + '&y1=' + y1 + '&x2=' + x2 + '&y2=' + y2;
                        });


                    // %z - zoom; %x,%y - coordinates
                    //var mapUrl = '{{conf.requrl}}/api/wellfile/?well_id=80&purpose=history&status=work&file_name=fid20130212221840151_MOTsketch.jpeg&crop(%z,%z,%x,%y)'
                    //return new ymaps.Layer(mapUrl);
                };

                // add layer to map storage
                ymaps.layer.storage.add("my#well", WellMapLayer);

                // create new map type from our layer
                ymaps.mapType.storage.add("my#well", new ymaps.MapType(
                        'Well map', ['my#well']
                    ));

                var myMap = new ymaps.Map('map', {
                    center: [128, 128],
                    zoom: 1,
                    behaviors: ['default', 'scrollZoom'],
                    type: 'my#well' // map type key
                }, {
                    maxZoom: 4,
                    minZoom: 1,
                    projection: myProjection
                });

                var mapTools = new ymaps.control.MapTools({ items: ["drag", "ruler"] });
                //myMap.controls.add(mapTools, { top: 5, right: 5 });
                myMap.controls.add('smallZoomControl', { top: 70, right: 5 });
                myMap.controls.add('scaleLine');

                var mapRuler = myMap.behaviors.get('ruler');

                var myAddArea = new ymaps.control.Button({
                    data: {
                        content: 'Add area',
                        title: 'Specify few points on the map'
                    }
                }, {
                    selectOnClick: false
                });

                var mySetScale = new ymaps.control.Button({
                    data: {
                        content: 'Set scale',
                        title: 'Specify two point on this map'
                    }
                }, {
                    selectOnClick: false
                });

                mySetScale.events.add('click', function () {
                    mapTools.getDefaultGroup().get("ruler").select();
                    var rulerDataArray = mapRuler.getState().split('~');
                    if (rulerDataArray.length !== 2) {
                        alert('Please specify two points on the map');
                        return;
                    }

                    var inputDistance = document.createElement('input');
                    inputDistance.type = 'text';
                    $(inputDistance).prop({ 'required': true }).addClass('form-control');

                    var innerDiv = document.createElement('div');
                    $(innerDiv).addClass('form-horizontal').append(
                         bootstrapModal.gnrtDom('Actual distance, feet', inputDistance)
                    );

                    var submitFunction = function () {
                        var actualDistance = $(inputDistance).val();
                        if (!parseFloat(actualDistance)) {
                            alert('Please specify actual distance as integer/float number');
                            return;
                        }

                        // translate to meters
                        actualDistance = actualDistance * 0.3048;

                        // coordinate difference of two points (specified in the second point)
                        var rulerDifCoords = rulerDataArray[1].split(',');
                        var lineLength = Math.sqrt(Math.pow(rulerDifCoords[0], 2) + Math.pow(rulerDifCoords[1], 2));

                        wellFieldMapItem.ScaleCoefficient(parseFloat(actualDistance) / lineLength);
                        wellFieldMapItem.setScaleCoefficient();

                        var newProjection = new ymaps.projection.Cartesian([
                                    [0, 0], // left bottom
                                    [256, 256]  // right top
                        ], [false, false], wellFieldMapItem.ScaleCoefficient());

                        //var stringReadyScale = Number((wellFieldMapItem.ScaleCoefficient()).toFixed(4));
                        //('1:' + stringReadyScale + ' (1 pixel * zoom = ' + stringReadyScale + ' meters)');
                        bootstrapModal.closeModalWindow();
                        myMap.options.set('projection', newProjection);
                    };

                    bootstrapModal.openModalWindow('Scale', innerDiv, submitFunction);
                });

                myAddArea.events.add('click', function () {
                    mapTools.getDefaultGroup().get('ruler').select();

                    var rulerDataArray = mapRuler.getState().split('~');
                    if (rulerDataArray.length < 3) {
                        alert('Please specify three or more points on the map');
                        return;
                    }

                    var pointArray = [];
                    pointArray[0] = [parseFloat(rulerDataArray[0].split(',')[0]), parseFloat(rulerDataArray[0].split(',')[1])];
                    for (var pi = 1; pi < rulerDataArray.length; pi++) {
                        var tpa = rulerDataArray[pi].split(',');
                        pointArray[pi] = [parseFloat(tpa[0]) + parseFloat(pointArray[pi - 1][0]), parseFloat(tpa[1]) + parseFloat(pointArray[pi - 1][1])];
                    }

                    pointArray.push([parseFloat(rulerDataArray[0].split(',')[0]), parseFloat(rulerDataArray[0].split(',')[1])]);

                    var needArray = $.map(pointArray, function (pValue) {
                        return [[pValue[1], pValue[0]]];
                    });

                    wellFieldMapItem.addWellFieldMapArea(needArray, myMap, true);
                    //bootstrapModal.openModalWindow('Area', innerDiv, submitFunction);
                    mapTools.getDefaultGroup().get('drag').select();
                });

                // add object (placemark)
                var myAddObj = new ymaps.control.Button({
                    data: {
                        content: 'Add well',
                        title: 'Click to the map to add well'
                    }
                }, {
                    selectOnClick: true
                });

                myAddObj.events.add('select', function () {
                    mapTools.getDefaultGroup().get("drag").select();
                });

                myMap.controls.add(new ymaps.control.ToolBar([
                    mySetScale,
                    myAddArea,
                    myAddObj,
                    mapTools
                ]), { top: 5, right: 5 });

                //mapTools.getDefaultGroup().get("drag").disable();

                ////var polygon = new ymaps.Polygon([
                ////// Координаты внешнего контура.
                ////[[0.7, 0.6], [0.3, 0.7], [0.4, 0.6], [0.5, 0.4], [0.5, 0.3]]
                ////], {
                ////    hintContent: "Area"
                ////}, {
                ////    fillColor: '#6699ff',
                ////    // Делаем полигон прозрачным для событий карты.
                ////    interactivityModel: 'default#transparent',
                ////    strokeWidth: 8,
                ////    opacity: 0.5
                ////});
                ////myMap.geoObjects.add(polygon);

                ////myMap.balloon.open(myMap.getCenter(), {
                ////    myBodyContent: '<b>body content</b>',
                ////    myFooterContent: 'footer content'
                ////}, {
                ////    contentBodyLayout: ymaps.templateLayoutFactory.createClass('<p>$[myBodyContent]</p>'),
                ////    contentFooterLayout: ymaps.templateLayoutFactory.createClass('<i>$[myFooterContent]</i>')
                ////});

                // Установим через 5 секунд свойтво в геообъекте. Макет контента иконки отследит это обновление и обновит содержимое.
                ////setTimeout(function () {
                ////    myGeoObject.properties.set('description', 'my description after timeout');
                ////}, 5000);

                myMap.events.add('click', function (e) {
                    if (myAddObj.state.get('selected')) {
                        var coords = e.get('coordPosition');
                        selectWellForMap(coords, myMap, wellFieldMapItem, wellFieldItem);

                        //myMap.geoObjects.remove(myGeoObject);
                        ////var myGeoObject = 

                        ////myMap.geoObjects.add(myGeoObject);
                        ////myGeoObject.balloon.open();

                        //var myPlacemark = new ymaps.Placemark(coords, {
                        //    //balloonContent: '<div style="margin-bottom:12px">Well about</div>',
                        //    iconContent: 'w',
                        //    hintContent: 'Well ' + appMoment().format('HHmmss')
                        //}, {
                        //    preset: "twirl#blackStretchyIcon",
                        //    // Отключаем кнопку закрытия балуна.
                        //    balloonCloseButton: false,
                        //    // Балун будем открывать и закрывать кликом по иконке метки.
                        //    hideIconOnBalloonOpen: false
                        //    //iconImageHref: '/myIcon.gif', // картинка иконки
                        //    //iconImageSize: [15, 21], // размеры картинки
                        //    //iconImageOffset: [-3, -21] // смещение картинки
                        //});

                        //////myPlacemark.events.add('click', function (e) {
                        //////});

                        //myMap.geoObjects.add(myPlacemark);

                        ////myPlacemark.geometry.setCoordinates(coords);

                        ////myPlacemark.Point.position = coords;
                        ////myMap.geoObjects.remove(myPlacemark);

                        ////myMap.balloon.open(coords, {
                        ////    contentHeader: 'Событие!',
                        ////    contentBody: '<p>Кто-то щелкнул по карте.</p>' +
                        ////        '<p>Координаты щелчка: ' + [
                        ////            coords[0].toPrecision(6),
                        ////            coords[1].toPrecision(6)
                        ////        ].join(', ') + '</p>',
                        ////    contentFooter: '<sup>Щелкните еще раз</sup>'
                        ////});
                    }
                });

                return myMap;
            }

            function selectWellForMap(coords, needMap, wellFieldMapItem, wellFieldItem) {
                var drawIdArray = [];
                for (var tk = 0; tk < wellFieldMapItem.WellInWellFieldMaps().length; tk++) {
                    drawIdArray.push(wellFieldMapItem.WellInWellFieldMaps()[tk].WellId);
                }

                var notAddedCount = 0;
                var selectInputString = '<select id="well-select" class="form-control"><option value="">select well...</option>';
                // make well array for select input
                for (var WellGroupKey = 0; WellGroupKey < wellFieldItem.WellGroups().length; WellGroupKey++) {
                    selectInputString += '<optgroup label="' + wellFieldItem.WellGroups()[WellGroupKey].Name() + '">';
                    for (var WellKey = 0; WellKey < wellFieldItem.WellGroups()[WellGroupKey].Wells().length; WellKey++) {
                        if ($.inArray(wellFieldItem.WellGroups()[WellGroupKey].Wells()[WellKey].Id, drawIdArray) === -1) {
                            notAddedCount++;
                            selectInputString += '<option value="' + wellFieldItem.WellGroups()[WellGroupKey].Wells()[WellKey].Id + '">' + wellFieldItem.WellGroups()[WellGroupKey].Wells()[WellKey].Name() + '</option>';
                        }
                    }

                    selectInputString += '</optgroup>';
                }
                selectInputString += '</select>';

                if (notAddedCount === 0) {
                    alert('No wells for adding');
                    return;
                }

                var divString = '<div style="padding:8px">' +
                    '<h5>$[properties.name]</h5>' +
                    '<div>' + selectInputString + '</div>' +
                    '<div class="clearfix" style="margin-top: 8px"><div class="pull-right"><button class="btn btn-default btn-xs" id="well_edit_save_button">Save</button></div></div>' +
                    '</div>';

                // с префиксом balloon. В данном случае options.contentBodyLayout - вложенный макет.
                var myBalloonContentLayout = ymaps.templateLayoutFactory.createClass('<p>$[[options.contentBodyLayout]]</p>');
                // Создание макета основного содержимого контента балуна.
                var myBalloonContentBodyLayout = ymaps.templateLayoutFactory.createClass(divString, {
                    build: function () {
                        myBalloonContentBodyLayout.superclass.build.call(this);
                        $('#well_edit_save_button').on('click', this.wellEditSave);
                        $('#count').html('choose');
                    },
                    clear: function () {
                        $('#counter-button').off('click', this.onCounterClick);
                        myBalloonContentBodyLayout.superclass.clear.call(this);
                    },
                    wellEditSave: function () {
                        var selectedWellId = $('#well-select').val();

                        ////needMap.geoObjects.remove(geoObject);
                        if (selectedWellId) {
                            ////geoObject.properties.set('name', $('#well-select option:selected').text());
                            //geoObject.properties.set('hintContent', $('#well-select option:selected').text());
                            // save or create object in database with need (coords, selectedWellId, wellFieldMapItem.Id)
                            // apply to this point
                            wellFieldMapItem.addWellInWellFieldMap(selectedWellId, coords[0], coords[1], needMap);
                        }

                        needMap.balloon.close();
                    }
                });


                ////+ '[if properties.description]<i>$[properties.description]</i>[else]$[properties.metaDataProperty.description][endif]'
                // Создание макета для контента метки.
                ////var myIconContentLayout = ymaps.templateLayoutFactory.createClass(
                ////    '<small id="layout-element">$[properties.name]</small>', {
                ////        build: function () {
                ////            // необходим вызов родительского метода, чтобы добавить содержимое макета в DOM
                ////            this.constructor.superclass.build.call(this);
                ////            $('#layout-element').bind('mouseover', this.onNameHover);
                ////        },
                ////        clear: function () {
                ////            $('#layout-element').unbind('mouseover', this.onNameHover);
                ////            this.constructor.superclass.clear.call(this);
                ////        },
                ////        onNameHover: function () {
                ////            $('#layout-element').css('color', getRandomColor());
                ////        }
                ////    });

                ////var getRandomColor = function () {
                ////    return 'rgb(' +
                ////        [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)].join(',') +
                ////    ')';
                ////};

                needMap.balloon.open(coords,
                    {
                        name: 'Well'
                    }, {
                        contentBodyLayout: myBalloonContentBodyLayout,
                        contentLayout: myBalloonContentLayout
                    });


                ////new ymaps.GeoObject({
                ////    geometry: {
                ////        type: "Point",
                ////        coordinates: coords
                ////    },
                ////    properties: {

                ////    }
                ////}, {
                ////    ////iconImageHref: '/img/drop.png', // картинка иконки
                ////    ////iconImageSize: [12, 18], // размеры картинки
                ////    ////iconImageOffset: [-3, -21], // смещение картинки
                ////    balloonContentBodyLayout: myBalloonContentBodyLayout,
                ////    balloonContentLayout: myBalloonContentLayout,
                ////    //iconContentLayout: myIconContentLayout,
                ////    // Выставляем тянущийся макет иконки, чтобы вместился вложенный макет myIconContentLayout.
                ////    //preset: 'twirl#nightStretchyIcon'
                ////}));
            }

            function drawWellInWellFieldMap(needMap, wellInWellFieldMapItem) {
                var divString = '<div style="padding: 0 8px">' +
                    '<h5 class="text-center">$[properties.name]</h5>' +
                    '<p style="word-wrap: break-word; max-height: 40px; overflow: auto">$[properties.description]</p>' +
                    '<div class="text-center">' +
                    '<button class="btn btn-xs btn-default" id="del_well_from_map">Remove from this map</button>' +
                    '</div>' +
                    '</div>';

                // с префиксом balloon. В данном случае options.contentBodyLayout - вложенный макет.
                var myBalloonContentLayout = ymaps.templateLayoutFactory.createClass('<p>$[[options.contentBodyLayout]]</p>');
                // Создание макета основного содержимого контента балуна.
                var myBalloonContentBodyLayout = ymaps.templateLayoutFactory.createClass(divString, {
                    build: function () {
                        myBalloonContentBodyLayout.superclass.build.call(this);
                        $('#del_well_from_map').on('click', this.delWellFromMap);
                    },
                    clear: function () {
                        $('#del_well_from_map').off('click', this.delWellFromMap);
                        myBalloonContentBodyLayout.superclass.clear.call(this);
                    },
                    delWellFromMap: function () {
                        wellInWellFieldMapItem.deleteWellInWellFieldMap();
                        needMap.geoObjects.remove(pointObject);
                    }
                });

                var currentWell = wellInWellFieldMapItem.getWell();

                var pointObject = new ymaps.GeoObject({
                    geometry: {
                        type: "Point",
                        coordinates: [wellInWellFieldMapItem.longitude(), wellInWellFieldMapItem.latitude()]
                    },
                    properties: {
                        name: currentWell.Name(),
                        hintContent: currentWell.Name(),
                        description: currentWell.Description()
                        //name: wellInWellFieldMapItem.LinkWell().Name(),
                        //metaDataProperty: {
                        //    description: wellInWellFieldMapItem.LinkWell().Description()
                        //}
                    }
                }, {
                    balloonContentBodyLayout: myBalloonContentBodyLayout,
                    balloonContentLayout: myBalloonContentLayout
                });
                // place to map
                needMap.geoObjects.add(pointObject);
            }

            function drawWellFieldMapArea(needMap, wellFieldMapAreaItem, isShowEditBalloon) {
                var divString = '<div style="padding: 0 8px">' +
                    '<div><input type="text" class="form-control" value="$[properties.name]" id="wellfield_map_area_name"/></div>' +
                    '<div><textarea rows="3" class="form-control" id="wellfield_map_area_description">$[properties.description]</textarea></div>' +
                    '<div class="clearfix min-top-margin">' +
                    '<div class="pull-left"><button class="btn btn-default btn-sm" id="del_area_from_map">Delete</button></div>' +
                    '<div class="pull-right"><button class="btn btn-default btn-sm" id="save_map_area">Save</button></div>' +
                    '</div>' +
                    '</div>';

                // с префиксом balloon. В данном случае options.contentBodyLayout - вложенный макет.
                var myBalloonContentLayout = ymaps.templateLayoutFactory.createClass('<p>$[[options.contentBodyLayout]]</p>');
                // Создание макета основного содержимого контента балуна.
                var myBalloonContentBodyLayout = ymaps.templateLayoutFactory.createClass(divString, {
                    build: function () {
                        myBalloonContentBodyLayout.superclass.build.call(this);
                        $('#del_area_from_map').on('click', this.delAreaFromMap);
                        $('#save_map_area').on('click', this.saveMapArea);
                    },
                    clear: function () {
                        $('#del_area_from_map').off('click', this.delAreaFromMap);
                        $('#save_map_area').off('click', this.saveMapArea);
                        myBalloonContentBodyLayout.superclass.clear.call(this);
                    },
                    delAreaFromMap: function () {
                        wellFieldMapAreaItem.deleteWellFieldMapArea();
                        needMap.geoObjects.remove(myPolygon);
                    },
                    saveMapArea: function () {
                        var aName = $('#wellfield_map_area_name').val();
                        var aDescription = $('#wellfield_map_area_description').val();

                        wellFieldMapAreaItem.Name(aName);
                        wellFieldMapAreaItem.Description(aDescription);
                        // save properties to map object

                        myPolygon.properties.set('name', aName);
                        myPolygon.properties.set('description', aDescription);

                        wellFieldMapAreaItem.saveChangedWellFieldMapArea();
                        myPolygon.balloon.close();
                        if (isShowEditBalloon) {
                            needMap.behaviors.get('ruler').close();
                        }
                    }
                });

                var needArray = appHelper.stringToTwoDimArray(wellFieldMapAreaItem.Coords());

                var myPolygon = new ymaps.GeoObject({
                    geometry: {
                        type: 'Polygon',
                        coordinates: new Array(needArray)
                    },
                    properties: {
                        name: wellFieldMapAreaItem.Name(),
                        hintContent: 'Area = ' + wellFieldMapAreaItem.areaSize().toFixed(4) + ' sq ft',
                        description: wellFieldMapAreaItem.Description()
                    }
                }, {
                    fillColor: wellFieldMapAreaItem.FillColor(),
                    interactivityModel: 'default#transparent',
                    strokeWidth: wellFieldMapAreaItem.StrokeWidth(),
                    opacity: wellFieldMapAreaItem.Opacity(),
                    balloonContentBodyLayout: myBalloonContentBodyLayout,
                    balloonContentLayout: myBalloonContentLayout
                });

                needMap.geoObjects.add(myPolygon);

                if (isShowEditBalloon) {
                    myPolygon.balloon.open();
                }

                ////myPolygon.events.add('click', function (e) {});
                ////mapRuler.close();    
            }

            self.showWellFieldMap = function () {
                self.getWellField().selectedWellFieldMap(self);
            };

            self.afterRenderMapObj = function () {
                require(['yandex-map'], function () {
                    ymaps.ready(function () {
                        var tmpMap = initYandexMap(self, self.getWellField());

                        for (var i = 0; i < self.WellInWellFieldMaps().length; i++) {
                            // define well item
                            drawWellInWellFieldMap(tmpMap, self.WellInWellFieldMaps()[i]);
                        }

                        //  add areas to the map
                        for (var k = 0; k < self.WellFieldMapAreas().length; k++) {
                            drawWellFieldMapArea(tmpMap, self.WellFieldMapAreas()[k], false);
                        }
                    });
                });
            };

            self.addWellFieldMapArea = function (coords, fncMapImage, isShowEditBalloon) {
                var wellFieldMapAreaItem = datacontext.createWellFieldMapArea({
                    Name: 'New area',
                    Description: '',
                    Coords: appHelper.twoDimArrayToString(coords),
                    WellFieldMapId: self.Id,
                    Opacity: 0.4,
                    StrokeWidth: 1,
                    FillColor: '#2a79c9'
                }, self);

                datacontext.saveNewWellFieldMapArea(wellFieldMapAreaItem).done(function (result) {
                    var createdWFMA = datacontext.createWellFieldMapArea(result, self);
                    self.WellFieldMapAreas.push(createdWFMA);
                    drawWellFieldMapArea(fncMapImage, createdWFMA, isShowEditBalloon);
                });
            };

            self.addWellInWellFieldMap = function (wellId, longitude, latitude, fncMapImage) {
                // width or height need more than 255 , else do not load maps
                ////var tileLength = 255;
                ////var coordX = 0, coordY = 0;
                ////// if width > height
                ////var mapCoordScale = Math.max(self.Width, self.Height) / tileLength;

                ////coordX = latitude * mapCoordScale;
                ////coordY = (tileLength - longitude) * mapCoordScale;

                // save real coords in database

                var wellInWellFieldMapForAdd = datacontext.createWellInWellFieldMap({
                    WellFieldMapId: self.Id,
                    WellId: wellId,
                    Longitude: longitude,
                    Latitude: latitude
                }, self);

                datacontext.saveNewWellInWellFieldMap(wellInWellFieldMapForAdd).done(function (result) {
                    // redefine object from result
                    wellInWellFieldMapForAdd = datacontext.createWellInWellFieldMap(result, self);
                    // draw in map

                    self.WellInWellFieldMaps.push(wellInWellFieldMapForAdd);

                    drawWellInWellFieldMap(fncMapImage, wellInWellFieldMapForAdd);
                });
            };

            self.setScaleCoefficient = function () {
                datacontext.saveChangedWellFieldMap(self);
            };

            self.editWellFieldMap = function () {
                var inputName = document.createElement('input');
                inputName.type = 'text';
                $(inputName).val(self.Name()).prop({ 'required': true });

                var inputDescription = document.createElement('input');
                inputDescription.type = 'text';
                $(inputDescription).val(self.Description());

                var inputScaleCoefficient = document.createElement('input');
                inputScaleCoefficient.type = 'text';
                $(inputScaleCoefficient).val(self.ScaleCoefficient()).prop({
                    'required': true
                });

                var innerDiv = document.createElement('div');
                $(innerDiv).addClass('form-horizontal').append(
                    bootstrapModal.gnrtDom('Name', inputName),
                    bootstrapModal.gnrtDom('Description', inputDescription),
                    bootstrapModal.gnrtDom('ScaleCoefficient, 1:', inputScaleCoefficient)
                );

                function submitFunction() {
                    self.Name($(inputName).val());
                    self.Description($(inputDescription).val());
                    self.ScaleCoefficient($(inputScaleCoefficient).val());
                    datacontext.saveChangedWellFieldMap(self).done(function (result) {
                        self.Name(result.Name);
                        self.Description(result.Description);
                        self.ScaleCoefficient(result.ScaleCoefficient);
                    });
                    bootstrapModal.closeModalWindow();
                }

                bootstrapModal.openModalWindow("Well field map", innerDiv, submitFunction);
            };

            self.toPlainJson = function () { return ko.toJS(self); };

            // get areas
            self.WellFieldMapAreas(importWellFieldMapAreasDto(data.WellFieldMapAreasDto, self));
            self.WellInWellFieldMaps(importWellInWellFieldMapsDto(data.WellInWellFieldMapsDto, self));
        }

        datacontext.createWellFieldMap = function (item, wellField) {
            return new WellFieldMap(item, wellField);
        };
    });