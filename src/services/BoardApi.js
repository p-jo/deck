/*
 * @copyright Copyright (c) 2018 Michael Weimann <mail@michael-weimann.eu>
 *
 * @author Michael Weimann <mail@michael-weimann.eu>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import axios from 'nextcloud-axios'

/**
 * This class handles all the api communication with the Deck backend.
 */
export class BoardApi {

	url(url) {
		url = `/apps/deck${url}`
		return OC.generateUrl(url)
	}

	/**
	 * Updates a board.
	 *
	 * @param {Board} board
	 * @return Promise
	 */
	updateBoard(board) {
		return axios.put(this.url(`/boards/${board.id}`), board)
			.then(
				(response) => {
					return Promise.resolve(response.data)
				},
				(err) => {
					return Promise.reject(err)
				}
			)
			.catch((err) => {
				return Promise.reject(err)
			})
	}

	/**
	 * Creates a new board.
	 *
	 * @param {{String title, String color, String hashedColor}} boardData The board data to send.
	 * 															 hashedColor is the color in hex format, e.g. "#ff0000"
	 * 															 color is the same color without the "#"
	 * @return Promise
	 */
	createBoard(boardData) {
		return axios.post(this.url('/boards'), boardData)
			.then(
				(response) => {
					return Promise.resolve(response.data)
				},
				(err) => {
					return Promise.reject(err)
				}
			)
			.catch((err) => {
				return Promise.reject(err)
			})
	}

	deleteBoard(board) {
		return axios.delete(this.url(`/boards/${board.id}`))
			.then(
				() => {
					return Promise.resolve()
				},
				(err) => {
					return Promise.reject(err)
				}
			)
			.catch((err) => {
				return Promise.reject(err)
			})
	}

	unDeleteBoard(board) {
		return axios.post(this.url(`/boards/${board.id}/deleteUndo`))
			.then(
				(response) => {
					return Promise.resolve(response.data)
				},
				(err) => {
					return Promise.reject(err)
				}
			)
			.catch((err) => {
				return Promise.reject(err)
			})
	}

	loadBoards() {
		return axios.get(this.url('/boards'))
			.then(
				(response) => {
					return Promise.resolve(response.data)
				},
				(err) => {
					return Promise.reject(err)
				}
			)
			.catch((err) => {
				return Promise.reject(err)
			})
	}

	loadById(id) {
		return axios.get(this.url(`/boards/${id}`))
			.then(
				(response) => {
					return Promise.resolve(response.data)
				},
				(err) => {
					return Promise.reject(err)
				}
			)
			.catch((err) => {
				return Promise.reject(err)
			})
	}

	// Label API Calls
	deleteLabel(id) {
		return axios.delete(this.url(`/labels/${id}`))
		.then(
			(response) => {
				return Promise.resolve(response.data)
			},
			(err) => {
				return Promise.reject(err)
			}
		)
		.catch((err) => {
			return Promise.reject(err)
		})
	}

	updateLabel(label) {
		return axios.put(this.url('/labels/${label.id}'), label)
		.then(
			(response) => {
				return Promise.resolve(response.data)
			},
			(err) => {
				return Promise.reject(err)
			}
		)
		.catch((err) => {
			return Promise.reject(err)
		})
	}

	createLabel(labelData) {
		return axios.post(this.url('/labels'), labelData)
		.then(
			(response) => {
				return Promise.resolve(response.data)
			},
			(err) => {
				return Promise.reject(err)
			}
		)
		.catch((err) => {
			return Promise.reject(err)
		})
	}

}
