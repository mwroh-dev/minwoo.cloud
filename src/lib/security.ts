function isSafeRelativeHref(href: string) {
	const isProtocolRelativeHref = href.startsWith('//');
	if (isProtocolRelativeHref) {
		return false;
	}

	return (
		href.startsWith('/') ||
		href.startsWith('./') ||
		href.startsWith('../') ||
		href.startsWith('#') ||
		href.startsWith('?')
	);
}

export function isSafeHref(href: string | undefined) {
	if (!href) {
		return false;
	}

	if (isSafeRelativeHref(href)) {
		return true;
	}

	try {
		const url = new URL(href);
		return (
			url.protocol === 'http:' ||
			url.protocol === 'https:' ||
			url.protocol === 'mailto:' ||
			url.protocol === 'tel:'
		);
	} catch {
		return false;
	}
}

export function getSafeHref(href: string | undefined) {
	return isSafeHref(href) ? href : undefined;
}

export function isExternalHttpHref(href: string | undefined) {
	if (!href) {
		return false;
	}

	try {
		const url = new URL(href);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
}
