import React from 'react';
import { Leaf, Info, Droplets, Droplet, Sun, Wheat, Apple, Bug, LineChart, TrendingUp } from 'lucide-react';

export const AgronomyPlaybook = () => {
  return (
    <div className="space-y-8 max-w-4xl pb-12">
      
      <section className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        <div className="bg-forest-50 p-6 border-b border-earth-100 flex items-center gap-3">
          <Wheat className="w-6 h-6 text-forest-700" />
          <h2 className="text-2xl font-bold text-forest-900">1. Cereals (Staple Crops)</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-3">
             <h3 className="text-lg font-bold text-earth-900">General Management</h3>
             <ul className="list-disc pl-5 space-y-2 text-earth-800 text-sm">
               <li><strong className="text-earth-900">Soil:</strong> Generally perform well in sandy to loamy soils. Millet and Sorghum are highly drought-resistant and tolerate lower fertility.</li>
               <li><strong className="text-earth-900">Planting:</strong> Sow at the onset of the first steady rains (typically June/July). Wide spacing for Millet (up to 1m x 1m in Sahel) to reduce water competition.</li>
               <li><strong className="text-earth-900">Fertility:</strong> Apply organic manure during land preparation. Top dress with Nitrogen (or compost tea) 3-4 weeks after emerging.</li>
               <li><strong className="text-earth-900">Weeding:</strong> Critical in the first 2-4 weeks. Hand weeding is standard; striga (witchweed) is a major parasitic weed for sorghum/maize and requires crop rotation with legumes (cowpea/groundnut) to break the cycle.</li>
             </ul>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
             <div className="bg-earth-50 p-4 rounded-xl border border-earth-100">
               <h4 className="font-bold text-earth-900 mb-2">Rice (Irrigated vs Rainfed)</h4>
               <p className="text-sm text-earth-700">Rainfed strictly aligns with the rainy season. Irrigated rice (e.g., Senegal River Valley) utilizes nurseries and transplanting at 21 days for higher yields. Water control is paramount.</p>
             </div>
             <div className="bg-earth-50 p-4 rounded-xl border border-earth-100">
               <h4 className="font-bold text-earth-900 mb-2">Maize vs Millet</h4>
               <p className="text-sm text-earth-700">Maize requires significantly higher rainfall and fertilizer inputs than millet. Do not plant maize in marginal, dry sandy zones where millet/sorghum thrive.</p>
             </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        <div className="bg-amber-50 p-6 border-b border-earth-100 flex items-center gap-3">
          <Leaf className="w-6 h-6 text-amber-700" />
          <h2 className="text-2xl font-bold text-amber-900">2. Vegetables (High-Value Horticulture)</h2>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-sm text-earth-800">
            Often described as <em>Maraîchage</em>, vegetable farming is the primary cash engine for smallholders, especially in the dry season under irrigation.
          </p>
          <div className="space-y-4">
            <div className="border-l-4 border-amber-400 pl-4">
              <h4 className="font-bold text-earth-900">Nursery Management</h4>
              <p className="text-sm text-earth-700">Tomatoes, onions, cabbages, and peppers must start in shaded nurseries for 3-5 weeks. Keep soil damp, not waterlogged, to prevent damping-off disease.</p>
            </div>
            <div className="border-l-4 border-amber-400 pl-4">
              <h4 className="font-bold text-earth-900">Irrigation & Protection</h4>
              <p className="text-sm text-earth-700">Daily watering is required in the dry season. Micro-drip irrigation is highly recommended to save water and reduce fungal humidity on leaves. Apply Neem extract weekly to deter whiteflies and aphids.</p>
            </div>
            <div className="border-l-4 border-amber-400 pl-4">
              <h4 className="font-bold text-earth-900">Continuous Harvesting</h4>
              <p className="text-sm text-earth-700">Crops like Okra and Eggplant should be harvested frequently (every 2-3 days) to encourage the plant to continue flowering.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        <div className="bg-terracotta-50 p-6 border-b border-earth-100 flex items-center gap-3">
          <Apple className="w-6 h-6 text-terracotta-700" />
          <h2 className="text-2xl font-bold text-terracotta-900">3. Fruits & Orchards</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-earth-900 mb-2">Mango & Citrus</h3>
              <p className="text-sm text-earth-700 mb-2">Establishment takes 3-5 years. Grafting is highly recommended to ensure quality varieties (e.g., Kent, Keitt) and early fruiting.</p>
              <p className="text-sm text-earth-700"><strong>Pest Warning:</strong> Fruit flies are the #1 devastating pest for mangoes. Use pheromone traps and harvest slightly green to ripen off-tree.</p>
            </div>
            <div>
              <h3 className="font-bold text-earth-900 mb-2">Cashew & Baobab</h3>
              <p className="text-sm text-earth-700 mb-2">Cashews thrive in poor, sandy soils and require very little maintenance once established. A premier export crop.</p>
              <p className="text-sm text-earth-700">Baobab is often wild-harvested, but organized planting is rising for its high-value leaves (Laló) and fruit pulp.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        <div className="bg-forest-50 p-6 border-b border-earth-100 flex items-center gap-3">
          <Bug className="w-6 h-6 text-forest-700" />
          <h2 className="text-2xl font-bold text-forest-900">4. Organic Inputs & Bio-pesticides Manual</h2>
        </div>
        <div className="p-6 space-y-6">
           <p className="text-sm text-earth-800">
             Agroecological practices utilize local plant compounds to manage pests and build soil, reducing reliance on expensive synthetic chemicals.
           </p>
           
           <div className="bg-white border rounded-xl overflow-hidden text-sm">
             <div className="bg-earth-50 px-4 py-2 font-bold text-earth-900 border-b">The "Holy Trinity" of Local Bio-Pesticides</div>
             <div className="divide-y divide-earth-100">
               <div className="p-4 flex flex-col md:flex-row gap-4 justify-between">
                 <div>
                   <span className="font-bold text-forest-700">1. Neem (Azadirachta indica)</span>
                   <p className="text-earth-600 mt-1">Crushed seeds/leaves. Best overall preventative for chewing and sucking insects.</p>
                 </div>
               </div>
               <div className="p-4 flex flex-col md:flex-row gap-4 justify-between">
                 <div>
                   <span className="font-bold text-terracotta-700">2. Papaya Leaf Extract</span>
                   <p className="text-earth-600 mt-1">Excellent for breaking down fungal spores and combating thrips/aphids.</p>
                 </div>
               </div>
               <div className="p-4 flex flex-col md:flex-row gap-4 justify-between">
                 <div>
                   <span className="font-bold text-amber-700">3. Chili, Garlic & Onion</span>
                   <p className="text-earth-600 mt-1">Strong repellant spray. Apply locally to heavy infestations.</p>
                 </div>
               </div>
             </div>
           </div>
           
           <div className="space-y-2 mt-4">
             <h4 className="font-bold text-earth-900">Green Manure Strategy</h4>
             <p className="text-sm text-earth-700">Plant Cowpea or Mucuna between cereal rows or during the off-season. Do not harvest the pods; instead, slash the plants right before flowering and plow the green matter directly into the soil. This fixes atmospheric Nitrogen and adds crucial organic carbon to sandy soils.</p>
           </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        <div className="bg-blue-50 p-6 border-b border-earth-100 flex items-center gap-3">
          <LineChart className="w-6 h-6 text-blue-700" />
          <h2 className="text-2xl font-bold text-blue-900">5. Farm Business & Irrigation Systems</h2>
        </div>
        <div className="p-6 space-y-6">
           <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-earth-900 flex items-center gap-2 mb-2"><Droplets className="w-4 h-4 text-blue-500"/> Irrigation Strategies</h3>
                <ul className="text-sm text-earth-700 space-y-2 list-disc pl-4">
                  <li><strong>Rainfed (&lt;5% irrigated currently):</strong> Heavily dependent on the 4-month wet season. Implement tie-ridging and mulching to retain soil moisture tightly.</li>
                  <li><strong>Drip Irrigation:</strong> The gold standard for vegetables. Saves 60% water compared to flooding, reduces weed pressure, and allows simple fertigation (liquid fertilizer mixed in water).</li>
                  <li><strong>Solar Pumps:</strong> High initial CapEx but zero OPEX, replacing expensive petrol pumps across the region.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-earth-900 flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-green-600"/> Advanced Economics</h3>
                <ul className="text-sm text-earth-700 space-y-2 list-disc pl-4">
                  <li><strong>Post-Harvest Losses:</strong> Often consume 30% of yields. Invest in PICS bags (hermetically sealed) for cereals/cowpeas to prevent weevil damage without chemicals.</li>
                  <li><strong>Agroforestry:</strong> Integrating Faidherbia or Moringa in fields provides a dry-season safety net and boosts main crop yields via constant organic drop.</li>
                  <li><strong>Off-Season Advantage:</strong> Onions and Tomatoes grown in the dry season fetch 3x to 5x the price of rainy-season harvests.</li>
                </ul>
              </div>
           </div>
        </div>
      </section>
      
    </div>
  );
};
