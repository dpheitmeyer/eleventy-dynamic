import {
  EleventyEdge,
  precompiledAppData,
} from "./_generated/eleventy-edge-app.js";

export default async (request, context) => {
  try {
    let edge = new EleventyEdge("edge", {
      request,
      context,
      precompiled: precompiledAppData,
      // default is [], add more keys to opt-in e.g. ["appearance", "username"]
      cookies: []
    });
    edge.config((eleventyConfig) => {
      // Add some custom Edge-specific configuration
      // e.g. Fancier json output
      // eleventyConfig.addFilter("json", obj => JSON.stringify(obj, null, 2));
      eleventyConfig.addFilter("json", obj => JSON.stringify(obj, null, 2));

      eleventyConfig.addGlobalData("geo", context.geo);

      eleventyConfig.addFilter("closeBy", (parks) => {
        // calculate distance
        parks.forEach((p) => {
          let gc = calculateGreatCircle(Number(p.latitude), Number(p.longitude), context.geo.latitude, context.geo.longitude);
          p['_myDistanceMiles'] = Math.round(gc.distance_miles);
          p['_myDistanceKm'] = Math.round(gc.distance_kilometres);
        })
        // sort by distance
        parks.sort((a,b) => a._myDistanceMiles < b._myDistanceMiles ? -1 : 1);
        // top 5 or within 100 miles
        let closestParks = parks.filter( (p,i) => {
           return p._myDistanceMiles <= 100 || i < 5
        })
        return closestParks
      });
    });
    return await edge.handleResponse();
  } catch (e) {
    console.log("ERROR", { e });
    return context.next(e);
  }
};

// Here's what's available on context.geo
  // context: {
  //   geo: {
  //     city?: string;
  //     country?: {
  //       code?: string;
  //       name?: string;
  //     },
  //     subdivision?: {
  //       code?: string;
  //       name?: string;
  //     },
  //     latitude?: number;
  //     longitude?: number;
  //     timezone?: string;
  //   }
  // }


const DEGREES_IN_RADIAN = 57.29577951
const MEAN_EARTH_RADIUS_KM = 6371
const KILOMETRES_IN_MILE = 1.60934

function calculateGreatCircle(latitude1_degrees, longitude1_degrees, latitude2_degrees, longitude2_degrees)
{
    const gc = {};

    gc.latitude1_degrees = latitude1_degrees;
    gc.longitude1_degrees = longitude1_degrees;
    gc.latitude2_degrees = latitude2_degrees;
    gc.longitude2_degrees = longitude2_degrees;

    gc.latitude1_radians = 0;
    gc.longitude1_radians = 0;
    gc.latitude2_radians = 0;
    gc.longitude2_radians = 0;
    gc.central_angle_radians = 0;
    gc.central_angle_degrees = 0;
    gc.distance_kilometres = 0;
    gc.distance_miles = 0;
    gc.valid = true;

    validateDegrees(gc);

    if(gc.valid)
    {
        calculateRadians(gc);
        calculateCentralAngle(gc);
        calculateDistance(gc);
    }

    return gc;
}

function calcGreatCircle(latitude1_degrees, longitude1_degrees, latitude2_degrees, longitude2_degrees)
{
    const gc = {};

    gc.latitude1_degrees = latitude1_degrees;
    gc.longitude1_degrees = longitude1_degrees;
    gc.latitude2_degrees = latitude2_degrees;
    gc.longitude2_degrees = longitude2_degrees;

    gc.latitude1_radians = 0;
    gc.longitude1_radians = 0;
    gc.latitude2_radians = 0;
    gc.longitude2_radians = 0;
    gc.central_angle_radians = 0;
    gc.central_angle_degrees = 0;
    gc.distance_kilometres = 0;
    gc.distance_miles = 0;
    gc.valid = true;

    validateDegrees(gc);

    if(gc.valid)
    {
        calculateRadians(gc);
        calculateCentralAngle(gc);
        calculateDistance(gc);
    }

    return gc;
}

function validateDegrees(gc)
{
    gc.valid = true;

    if(gc.latitude1_degrees < -90.0 || gc.latitude1_degrees > 90.0)
    {
        gc.valid = false;
    }

    if(gc.longitude1_degrees < -180.0 || gc.longitude1_degrees > 180.0)
    {
        gc.valid = false;
    }

    if(gc.latitude2_degrees < -90.0 || gc.latitude2_degrees > 90.0)
    {
        gc.valid = false;
    }

    if(gc.longitude2_degrees < -180.0 || gc.longitude2_degrees > 180.0)
    {
        gc.valid = false;
    }
}


function calculateRadians(gc)
{
    gc.latitude1_radians = gc.latitude1_degrees / DEGREES_IN_RADIAN;
    gc.longitude1_radians = gc.longitude1_degrees / DEGREES_IN_RADIAN;

    gc.latitude2_radians = gc.latitude2_degrees / DEGREES_IN_RADIAN;
    gc.longitude2_radians = gc.longitude2_degrees / DEGREES_IN_RADIAN;
}


function calculateCentralAngle(gc)
{
    let longitudes_abs_diff;

    if(gc.longitude1_radians > gc.longitude2_radians)
    {
        longitudes_abs_diff = gc.longitude1_radians - gc.longitude2_radians;
    }
    else
    {
        longitudes_abs_diff = gc.longitude2_radians - gc.longitude1_radians;
    }

    gc.central_angle_radians = Math.acos(Math.sin(gc.latitude1_radians)
                                       * Math.sin(gc.latitude2_radians)
                                       + Math.cos(gc.latitude1_radians)
                                       * Math.cos(gc.latitude2_radians)
                                       * Math.cos(longitudes_abs_diff));

    gc.central_angle_degrees = gc.central_angle_radians * DEGREES_IN_RADIAN;
}


function calculateDistance(gc)
{
    gc.distance_kilometres = MEAN_EARTH_RADIUS_KM * gc.central_angle_radians;

    gc.distance_miles = gc.distance_kilometres / KILOMETRES_IN_MILE;
}

