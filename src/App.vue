<template>
  <div id="loader" v-if="loading" :class="{ start: start }">
    <i class="fa-solid fa-circle-notch fa-spin" id="spinner"></i>
  </div>

  <div id="header">
    <a href="">
      <img width="97" height="58" :src="logo">
    </a>

    <a href="https://www.laviefoods.com/produits/jambons-vegetaux/" target="_blank" id="product-link">
      <img :src="productImage" height="58">
    </a>
  </div>

  <div id="page-container">
    <div id="aside">
      <div id="search-container">
        <div class="auto-search-wrapper">
          <input
                  type="text"
                  autocomplete="off"
                  id="search"
                  class="full-width"
                  placeholder="Chercher par ville"
          />
        </div>

        <button id="geolocate-me" type="button" v-if="geolocationActivated" @click="geolocate">
          <i class="fa-solid fa-location-crosshairs"></i>
        </button>
      </div>

      <div class="locations-shadow-container top"></div>

      <div id="locations">
        <a href="#" @click="locationSelected($event, location)" v-for="location in locations" class="location">
          <div>
            {{ location.name }}

            <div class="location-details">
                <span v-if="location.link">
                  Visiter le site web
                </span>

              <span v-else>
                  {{ location.departmentNumber.toString().length === 1 ? '0' : '' }}{{ location.departmentNumber }} -
                  {{ location.city }}
                </span>
            </div>
          </div>

          <div class="location-distance" v-if="location.distance">
            {{ location.distance.toLocaleString() }} km
          </div>
        </a>
      </div>

      <div class="locations-shadow-container bottom"></div>
    </div>

    <div id="map"></div>
  </div>
</template>

<script src="./app.js"></script>
