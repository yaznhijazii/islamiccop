// Migrate old users to new system with partner codes
export const migrateOldUsers = () => {
  const usersData = localStorage.getItem('appUsers');
  
  // If no users exist, create default ones
  if (!usersData) {
    const defaultUsers = {
      noor: {
        password: 'nooryazan',
        name: 'نور وريكات',
        partnerCode: 'NOOR24',
        partnerId: 'yazan'
      },
      yazan: {
        password: 'nooryazan',
        name: 'يزن حجازي',
        partnerCode: 'YAZAN24',
        partnerId: 'noor'
      }
    };
    
    localStorage.setItem('appUsers', JSON.stringify(defaultUsers));
    console.log('✅ Default users created and linked');
  } else {
    // Update existing users if they don't have partner codes
    const users = JSON.parse(usersData);
    let needsUpdate = false;

    // Check if noor exists and needs update
    if (users.noor && !users.noor.partnerCode) {
      users.noor = {
        ...users.noor,
        password: 'nooryazan',
        name: 'نور وريكات',
        partnerCode: 'NOOR24',
        partnerId: 'yazan'
      };
      needsUpdate = true;
    }

    // Check if yazan exists and needs update
    if (users.yazan && !users.yazan.partnerCode) {
      users.yazan = {
        ...users.yazan,
        password: 'nooryazan',
        name: 'يزن حجازي',
        partnerCode: 'YAZAN24',
        partnerId: 'noor'
      };
      needsUpdate = true;
    }

    // If neither exist, create them
    if (!users.noor) {
      users.noor = {
        password: 'nooryazan',
        name: 'نور وريكات',
        partnerCode: 'NOOR24',
        partnerId: 'yazan'
      };
      needsUpdate = true;
    }

    if (!users.yazan) {
      users.yazan = {
        password: 'nooryazan',
        name: 'يزن حجازي',
        partnerCode: 'YAZAN24',
        partnerId: 'noor'
      };
      needsUpdate = true;
    }

    if (needsUpdate) {
      localStorage.setItem('appUsers', JSON.stringify(users));
      console.log('✅ Users updated with partner codes');
    }
  }
};