<script>
  // Verified bird photo IDs from Unsplash (Jan 2026)
  const photoIds = [
    '1552728089-57bdde30beb3',
    '1486365227551-f3f90034a57c',
    '1606567595334-d39972c85dbe',
    '1539664030485-a936c7d29c6e',
    '1444464666168-49d633b86797',
    '1555169062-013468b47731',
    '1669279284400-bcdd8dbdbd55',
    '1550853024-fae8cd4be47f',
    '1480044965905-02098d419e96',
    '1497206365907-f5e630693df0',
    '1520808663317-647b476a81b9',
    '1452570053594-1b985d6ea890',
    '1445820200644-69f87d946277',
    '1666777246899-053e06efdb35',
    '1551085254-e96b210db58a',
    '1490718720478-364a07a997cd',
    '1591055749071-927e6ddffc82',
    '1506102383123-c8ef1e872756',
    '1559827260-dc66d52bef19',
    '1559087867-ce4c91325525'
  ];

  let products = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Demon Template ${i + 1}`,
    subtitle: 'Premium UI Kit',
    image: `https://images.unsplash.com/photo-${photoIds[i]}?w=500&h=375&fit=crop&auto=format&q=80`
  }));
</script>

<div class="container mx-auto px-6 py-6">
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
    {#each products as product}
      <div class="relative group overflow-hidden rounded-box shadow-xl bg-base-300 aspect-[4/3] cursor-pointer border border-base-content/10">
        <img 
          src={product.image} 
          alt={product.name} 
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div class="absolute inset-x-0 bottom-0 bg-base-100/90 backdrop-blur-md p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0 border-t border-base-content/10">
            <h3 class="font-bold text-sm truncate text-base-content">{product.name}</h3>
            <p class="text-xs text-base-content/70 truncate">{product.subtitle}</p>
        </div>
      </div>
    {/each}
  </div>
</div>