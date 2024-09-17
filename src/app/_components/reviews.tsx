import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const reviewData = [
  {
    name: "Alice Johnson",
    avatar: "/images/avatar1.jpg",
    review: "This app has revolutionized how I manage my tasks. Highly recommended!",
    rating: 5
  },
  {
    name: "Bob Smith",
    avatar: "/images/avatar2.jpg",
    review: "Great features and user-friendly interface. Could use some minor improvements.",
    rating: 4
  },
  {
    name: "Carol Davis",
    avatar: "/images/avatar3.jpg",
    review: "Absolutely love it! Has all the features I need and more.",
    rating: 5
  }
];

const Reviews: React.FC = () => {
  return (
    <section className="reviews py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">What Our Users Say</h2>
        <div className="flex flex-col space-y-6 md:flex-row md:space-y-0 md:space-x-6">
          {reviewData.map((review, index) => (
            <Card key={index} className="flex-1">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src={review.avatar} alt={review.name} />
                    <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{review.name}</span>
                </div>
                <p className="text-gray-700 mb-4">{review.review}</p>
                <StarRating rating={review.rating} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;