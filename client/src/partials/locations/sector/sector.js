// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('SectorController', SectorController);

SectorController.$inject = [
  'LocationService', '$window', '$translate'
];

function SectorController(Locations, $window, $translate) {
  var vm = this;
  vm.session = {};
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.submit = submit;
  vm.update = update;
  vm.cancel = cancel;


  vm.loadProvinces = loadProvinces;
  vm.loadSectors = loadSectors;

  function handler(error) {
    console.error(error);
  }

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.session.loading = true;

    // load Subsidies
    refreshSectors();
  }

  function cancel() {
    vm.view = 'default';
  }

  function create() {
    vm.view = 'create';
    vm.sector = {};
  }

  vm.messages = {
    country : Locations.messages.country,
    province : Locations.messages.province,
    sector : Locations.messages.sector
  };

  /** load countries on startup */
  Locations.countries()
  .then(function (countries) {

    // bind the countries to the view for <select>ion
    vm.countries = countries;

    // make sure that we are showing the proper message to the client
    vm.messages.country = (countries.length > 0) ?
      Locations.messages.country :
      Locations.messages.empty;
  });

  /** loads provinces based on the selected country */
  function loadProvinces() {

    // make sure we do not make unnecessary HTTP requests
    if (!vm.sector.country_uuid) { return; }

    Locations.provinces({ country : vm.sector.country_uuid })
    .then(function (provinces) {

      // bind the provinces to the view for <select>ion
      vm.provinces = provinces;

      // make sure that we show the correct message in the <select> option
      vm.messages.province = (provinces.length > 0) ?
        Locations.messages.province :
        Locations.messages.empty;
    });
  }

  // switch to update mode
  // data is an object that contains all the information of a sector
  function update(data) {
    vm.view = 'update';
    vm.sector = data;

    vm.sector.sector_uuid = data.sectorUuid;
    vm.sector.province_uuid = data.provinceUuid;
    vm.sector.country_uuid = data.countryUuid;
    loadProvinces();
  }

  
  // refresh the displayed Sectors
  function refreshSectors() {
    return Locations.sectors({detailed : 1}).then(function (data) {
      vm.sectors = data;
      vm.session.loading = false;
    });
  }

  // form submission
  function submit(invalid) {
    if (invalid) { return; }

    var promise;
    var creation = (vm.view === 'create');
    var sector = angular.copy(vm.sector);
    
    promise = (creation) ?
      Locations.create.sector(sector) :
      Locations.update.sector(sector.uuid, sector);

    promise
      .then(function (response) {
        return refreshSectors();
      })
      .then(function () {
        vm.view = creation ? 'create_success' : 'update_success';
      })      
      .catch(handler);
  }

  startup();  
}