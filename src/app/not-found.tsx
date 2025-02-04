import React from 'react';

import { ArrowLeftCircle, Ghost } from 'lucide-react';
import Link from 'next/link';

function NotFoundPage () {
return (
	<div
		className="
			flex flex-col items-center justify-center
			min-h-screen
			text-gray-800
		">
    <div className="flex flex-col items-center justify-center">
        <Ghost className="w-20 h-20 text-gray-500 animate-bounce" />
        <h1 className="text-6xl font-bold mt-4">404</h1>
        <p className="text-xl mt-2">
					Oops! The page you're looking for vanished into thin air.
				</p>
        <Link
          href="/"
          className="
						flex items-center rounded-xl shadow-lg
						mt-6 px-6 py-3
						text-lg text-gray-800 bg-white
						hover:shadow-xl transition"
        >
          <ArrowLeftCircle className="w-5 h-5 mr-2" /> Go Back Home
        </Link>
      </div>
    </div>
	);
}

export default NotFoundPage;
