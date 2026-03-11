/**
 * WkndAboutUs
 * Decorates the About Us block into a WKND contributors layout.
 */
class WkndAboutUs {
	constructor(block) {
		this.block = block;
	}

	decorateIntro(row) {
		row.classList.add('about-us-intro');
		const introCell = row.querySelector(':scope > div');
		if (!introCell) return;

		introCell.classList.add('about-us-intro-content');

		const heading1 = introCell.querySelector('h1');
		if (heading1) heading1.classList.add('about-us-page-title');

		const heading2 = introCell.querySelector('h2');
		if (heading2) heading2.classList.add('about-us-contributors-title');

		const introList = introCell.querySelector('ul');
		if (introList) {
			introList.classList.add('about-us-intro-list');
			const firstItem = introList.querySelector('li');
			if (firstItem) {
				firstItem.classList.add('about-us-intro-copy');
			}
		}
	}

	decorateMember(member) {
		member.classList.add('about-us-member');

		const profilePicture = member.querySelector('picture');
		if (profilePicture) {
			const imageWrapper = profilePicture.closest('p') || profilePicture.parentElement;
			if (imageWrapper) imageWrapper.classList.add('about-us-member-image-wrap');
			profilePicture.classList.add('about-us-member-picture');
			const image = profilePicture.querySelector('img');
			if (image) {
				image.classList.add('about-us-member-image');
				image.loading = 'lazy';
			}
		}

		const name = member.querySelector('h3');
		if (name) name.classList.add('about-us-member-name');

		const role = member.querySelector('h5');
		if (role) role.classList.add('about-us-member-role');

		const socialList = member.querySelector('ul');
		if (socialList) {
			socialList.classList.add('about-us-member-social');

			// Unwrap any <p> wrappers around pictures (inconsistent authoring)
			socialList.querySelectorAll('p').forEach((paragraph) => {
				while (paragraph.firstChild) {
					paragraph.parentElement.insertBefore(paragraph.firstChild, paragraph);
				}
				paragraph.remove();
			});

			// Normalise: split any <li> containing multiple pictures into one <li> per picture
			[...socialList.querySelectorAll('li')].forEach((item) => {
				const pictures = [...item.querySelectorAll('picture')];
				if (pictures.length <= 1) return;
				// Keep first picture in the existing li, create new li for the rest
				pictures.slice(1).forEach((pic) => {
					const newItem = document.createElement('li');
					newItem.append(pic);
					item.after(newItem);
				});
			});

			// Now style every li — each has exactly one picture
			socialList.querySelectorAll('li').forEach((item) => {
				item.classList.add('about-us-member-social-item');
				const iconPicture = item.querySelector('picture');
				if (iconPicture) {
					iconPicture.classList.add('about-us-member-social-picture');
					const icon = iconPicture.querySelector('img');
					if (icon) {
						icon.classList.add('about-us-member-social-icon');
						icon.loading = 'lazy';
					}
				}
			});
		}
	}

	decorateMembers(row) {
		row.classList.add('about-us-members');
		const members = [...row.querySelectorAll(':scope > div')];
		members.forEach((member) => this.decorateMember(member));
	}

	decorate() {
		this.block.classList.add('wknd-about-us');
		const rows = [...this.block.querySelectorAll(':scope > div')];
		if (rows.length === 0) return;

		const [introRow, membersRow] = rows;
		if (introRow) this.decorateIntro(introRow);
		if (membersRow) this.decorateMembers(membersRow);
	}
}

export default async function decorate(block) {
	const aboutUs = new WkndAboutUs(block);
	aboutUs.decorate();
}
