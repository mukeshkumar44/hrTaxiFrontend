const CustomerReviews = () => {
  return (
    <div className="bg-gray-50 py-16 -mt-36">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Customer Reviews</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">See what our clients say about hrtaxi.com travel services.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Review 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <div className="flex text-yellow-500 mb-4">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            </div>
            <p className="text-gray-600 mb-4">"Outstanding service and friendly drivers made our trip unforgettable! Highly recommend."</p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden mr-4">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="Aarav Singh" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                  }}
                />
              </div>
              <div>
                <h4 className="font-semibold">Aarav Singh</h4>
                <p className="text-gray-500 text-sm">Delhi NCR</p>
              </div>
            </div>
          </div>
          
          {/* Review 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <div className="flex text-yellow-500 mb-4">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            </div>
            <p className="text-gray-600 mb-4">"I had a seamless booking experience with hrtaxi.com. Their team was professional and attentive, making my trip to Shimla memorable. Will use them again!"</p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden mr-4">
                <img 
                  src="https://randomuser.me/api/portraits/women/44.jpg" 
                  alt="Riya Mehta" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://randomuser.me/api/portraits/lego/2.jpg';
                  }}
                />
              </div>
              <div>
                <h4 className="font-semibold">Riya Mehta</h4>
                <p className="text-gray-500 text-sm">Mumbai</p>
              </div>
            </div>
          </div>
          
          {/* Review 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <div className="flex text-yellow-500 mb-4">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            </div>
            <p className="text-gray-600 mb-4">"The Char Dham tour was perfectly organized. The drivers were knowledgeable and accommodating. The entire journey was comfortable and spiritually fulfilling."</p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden mr-4">
                <img 
                  src="https://randomuser.me/api/portraits/men/22.jpg" 
                  alt="Vikram Patel" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://randomuser.me/api/portraits/lego/3.jpg';
                  }}
                />
              </div>
              <div>
                <h4 className="font-semibold">Vikram Patel</h4>
                <p className="text-gray-500 text-sm">Ahmedabad</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;