import React from 'react';
import { Sun, ThermometerSun, ShieldAlert, Bug, Droplet, Sprout, Wind } from 'lucide-react';

export const GreenhouseGuide = () => {
  return (
    <div className="space-y-8 max-w-4xl pb-12">
      <section className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        <div className="bg-emerald-50 p-6 border-b border-earth-100 flex items-center gap-3">
          <Sun className="w-6 h-6 text-emerald-700" />
          <h2 className="text-2xl font-bold text-emerald-900">Greenhouse & Protected Cropping in West Africa</h2>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-sm text-earth-800">
            Greenhouse farming is increasingly popular for high-value vegetables to extend seasons, control temperatures, and protect crops from heavy rainfall and pests during the wet season. However, it requires careful management.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4 text-sm text-earth-800">
              <div className="border-l-4 border-emerald-400 pl-4">
                <h4 className="font-bold text-earth-900 mb-1 flex items-center gap-2"><ThermometerSun className="w-4 h-4 text-emerald-600"/> Temperature & Ventilation</h4>
                <p>Greenhouses in the Sahel/Sudano-Guinean zone can easily exceed 50°C. High-arch designs with top ventilation and roll-up side walls (covered in insect netting) are mandatory. Use 30-40% white or aluminized shade nets to reflect solar radiation.</p>
              </div>
              <div className="border-l-4 border-emerald-400 pl-4">
                <h4 className="font-bold text-earth-900 mb-1 flex items-center gap-2"><Droplet className="w-4 h-4 text-emerald-600"/> Irrigation & Humidity</h4>
                <p>Drip irrigation is essential. High humidity inside the greenhouse can lead to fungal diseases (like Botrytis or Powdery Mildew). Water early in the morning and ensure good airflow.</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-earth-800">
               <div className="border-l-4 border-emerald-400 pl-4">
                <h4 className="font-bold text-earth-900 mb-1 flex items-center gap-2"><Sprout className="w-4 h-4 text-emerald-600"/> Soil Prep & Growing Mediums</h4>
                <p>Continuous cropping in a confined space leads to nematode build-up and soil-borne diseases. Solarization (covering moist soil with clear plastic for 4 weeks in the hot sun) is a must between cycles. Alternatively, use grow bags containing coco peat and compost.</p>
              </div>
              <div className="border-l-4 border-emerald-400 pl-4">
                <h4 className="font-bold text-earth-900 mb-1 flex items-center gap-2"><Wind className="w-4 h-4 text-emerald-600"/> Pollination</h4>
                <p>Since natural pollinators (bees, wind) are excluded, crops like tomatoes require manual pollination. This is done by gently shaking or tapping the supporting wires/strings every morning when humidity is ideal, or by introducing bumblebees if available.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        <div className="bg-amber-50 p-6 border-b border-earth-100 flex items-center gap-3">
          <Bug className="w-6 h-6 text-amber-700" />
          <h2 className="text-2xl font-bold text-amber-900">Pest & Disease Management (IPM)</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-earth-800 mb-4">
             Protected cropping creates a haven for certain pests if they get inside. <strong>Prevention is key.</strong>
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
             <div className="bg-white p-4 rounded-xl border border-earth-200">
               <h4 className="font-bold text-earth-900 mb-2">Spider Mites & Whiteflies</h4>
               <p className="text-sm text-earth-700">These pests thrive in hot, enclosed spaces. Use yellow and blue sticky traps consistently. Apply preventative foliar sprays of Neem oil before populations explode.</p>
             </div>
             <div className="bg-white p-4 rounded-xl border border-earth-200">
               <h4 className="font-bold text-earth-900 mb-2">Nematodes</h4>
               <p className="text-sm text-earth-700">A major issue in greenhouse soils. Practice crop rotation with resistant varieties, solarize the soil, or utilize soilless mediums (grow bags).</p>
             </div>
             <div className="bg-white p-4 rounded-xl border border-earth-200">
               <h4 className="font-bold text-earth-900 mb-2">Fungal Diseases</h4>
               <p className="text-sm text-earth-700">Due to high humidity. Ensure adequate plant spacing, prune lower leaves (especially on tomatoes) to improve airflow, and use Garlic or Papaya leaf extracts as preventative bio-fungicides.</p>
             </div>
             <div className="bg-white p-4 rounded-xl border border-earth-200">
               <h4 className="font-bold text-earth-900 mb-2">Strict Hygiene</h4>
               <p className="text-sm text-earth-700">Implement double-door entry systems. Disinfect tools between plants. Immediately remove and burn any infected plant material outside the greenhouse.</p>
             </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        <div className="bg-blue-50 p-6 border-b border-earth-100 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-blue-700" />
          <h2 className="text-2xl font-bold text-blue-900">Suitable Greenhouse Crops</h2>
        </div>
        <div className="p-6 divide-y divide-earth-100">
          <div className="flex gap-4 py-4 first:pt-0 last:pb-0">
             <div className="w-1/3 font-bold text-earth-900">Tomatoes (Indeterminate)</div>
             <div className="w-2/3 text-sm text-earth-700">High yield potential. Requires trellising/stringing up to 2-3 meters and regular pruning of side shoots. Very susceptible to nematodes and whiteflies.</div>
          </div>
          <div className="flex gap-4 py-4 first:pt-0 last:pb-0">
             <div className="w-1/3 font-bold text-earth-900">Bell Peppers & Sweet Peppers</div>
             <div className="w-2/3 text-sm text-earth-700">High market value, especially colored varieties. Requires trellising. Sensitive to extreme heat ({">"}35°C), which can cause flower drop.</div>
          </div>
          <div className="flex gap-4 py-4 first:pt-0 last:pb-0">
             <div className="w-1/3 font-bold text-earth-900">Cucumbers (Parthenocarpic)</div>
             <div className="w-2/3 text-sm text-earth-700">Must use parthenocarpic seed varieties (they do not require pollination to set fruit). Extremely fast growing, requiring daily harvesting and high water input.</div>
          </div>
          <div className="flex gap-4 py-4 first:pt-0 last:pb-0">
             <div className="w-1/3 font-bold text-earth-900">Lettuce & Leafy Greens</div>
             <div className="w-2/3 text-sm text-earth-700">Often grown in hydroponic setups inside shade nets or greenhouses to prevent bolting and protect from heavy rains.</div>
          </div>
        </div>
      </section>

    </div>
  );
};
