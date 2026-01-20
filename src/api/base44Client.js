// Mock implementation of base44 client
class Base44Client {
  constructor() {
    this.entities = {
      Match: {
        list: async (sort = '') => {
          // Return mock match data
          return [
            { id: 1, date: '2023-01-15', opponent: 'John Doe', result: 'win', score: '6-4, 6-3' },
            { id: 2, date: '2023-01-10', opponent: 'Jane Smith', result: 'loss', score: '4-6, 6-7(5)' },
            { id: 3, date: '2023-01-05', opponent: 'Mike Johnson', result: 'win', score: '6-2, 6-1' },
          ].sort((a, b) => {
            if (sort.startsWith('-')) {
              const field = sort.substring(1);
              return new Date(b[field]) - new Date(a[field]);
            }
            return new Date(a[sort]) - new Date(b[sort]);
          });
        },
        create: async (data) => {
          // Simulate API call
          console.log('Creating match:', data);
          return { ...data, id: Date.now() };
        },
      },
    };
  }
}

// Create and export a singleton instance
export const base44 = new Base44Client();

export default base44;
