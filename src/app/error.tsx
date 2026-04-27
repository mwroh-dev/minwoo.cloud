'use client';

import React from 'react';

import Link from 'next/link';
import { Home, RefreshCcw, TriangleAlert } from 'lucide-react';

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen text-gray-800">
			<div className="flex flex-col items-center justify-center max-w-xl text-center px-6">
				<TriangleAlert className="w-14 h-14 text-gray-500" />
				<h1 className="text-4xl font-bold mt-4">Something went wrong</h1>
				<p className="text-lg mt-3 text-gray-600">
					{error.message || 'An unexpected error occurred while loading this page.'}
				</p>
				<div className="flex gap-3 mt-6">
					<button
						type="button"
						onClick={reset}
						className="flex items-center rounded-xl shadow-lg px-5 py-3 text-lg text-gray-800 bg-white hover:shadow-xl transition"
					>
						<RefreshCcw className="w-5 h-5 mr-2" /> Try again
					</button>
					<Link
						href="/"
						className="flex items-center rounded-xl shadow-lg px-5 py-3 text-lg text-gray-800 bg-white hover:shadow-xl transition"
					>
						<Home className="w-5 h-5 mr-2" /> Go Home
					</Link>
				</div>
			</div>
		</div>
	);
}
