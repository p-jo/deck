/*
 * @copyright Copyright (c) 2018 Julius Härtl <jus@bitgrid.net>
 *
 * @author Julius Härtl <jus@bitgrid.net>
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

import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'nextcloud-axios'
import { boardToMenuItem } from './../helpers/boardToMenuItem'
import { BoardApi } from './../services/BoardApi'
import stack from './stack'
import card from './card'

Vue.use(Vuex)

const apiClient = new BoardApi()
const debug = process.env.NODE_ENV !== 'production'

export const BOARD_FILTERS = {
	ALL: '',
	ARCHIVED: 'archived',
	SHARED: 'shared'
}

export default new Vuex.Store({
	modules: {
		stack,
		card
	},
	strict: debug,
	state: {
		navShown: true,
		sidebarShown: false,
		currentBoard: null,
		boards: [],
		sharees: [],
		boardFilter: BOARD_FILTERS.ALL
	},
	getters: {
		boards: state => {
			return state.boards
		},
		sharees: state => {
			return state.sharees
		},
		noneArchivedBoards: state => {
			return state.boards.filter(board => {
				return board.archived === false && !board.deletedAt
			})
		},
		archivedBoards: state => {
			return state.boards.filter(board => {
				return board.archived === true && !board.deletedAt
			})
		},
		sharedBoards: state => {
			return state.boards.filter(board => {
				return board.shared && !board.deletedAt
			})
		},
		filteredBoards: state => {
			// filters the boards depending on the active filter
			const boards = state.boards.filter(board => {
				return (state.boardFilter === BOARD_FILTERS.ALL && board.archived === false)
					|| (state.boardFilter === BOARD_FILTERS.ARCHIVED && board.archived === true)
					|| (state.boardFilter === BOARD_FILTERS.SHARED && board.shared === 1)
			})
			return boards.map(boardToMenuItem)
		},
		currentBoardLabels: state => {
			return state.currentBoard.labels
		}
	},
	mutations: {
		/**
		 * Adds or replaces a board in the store.
		 * Matches a board by it's id.
		 *
		 * @param state
		 * @param board
		 */
		addBoard(state, board) {
			const indexExisting = state.boards.findIndex((b) => {
				return board.id === b.id
			})

			if (indexExisting > -1) {
				Vue.set(state.boards, indexExisting, board)
			} else {
				state.boards.push(board)
			}
		},
		/**
		 * Removes the board from the store.
		 *
		 * @param state
		 * @param board
		 */
		removeBoard(state, board) {
			state.boards = state.boards.filter((b) => {
				return board.id !== b.id
			})
		},
		toggleNav(state) {
			state.navShown = !state.navShown
		},
		toggleSidebar(state) {
			state.sidebarShown = !state.sidebarShown
		},
		setBoards(state, boards) {
			state.boards = boards
		},
		setSharees(state, sharees) {
			state.sharees = sharees
		},
		setBoardFilter(state, filter) {
			state.boardFilter = filter
		},
		setCurrentBoard(state, board) {
			state.currentBoard = board
		},

		// label mutators
		removeLabelFromCurrentBoard(state, labelId) {
			const removeIndex = state.currentBoard.labels.findIndex((l) => {
				return labelId === l.id
			})

			if (removeIndex > -1) {
				state.currentBoard.labels.splice(removeIndex, 1)
			}
		},
		updateLabelFromCurrentBoard(state, newLabel) {

			let labelToUpdate = state.currentBoard.labels.find((l) => {
				return newLabel.id === l.id
			})

			labelToUpdate.title = newLabel.title
			labelToUpdate.color = newLabel.color
		},
		addLabelToCurrentBoard(state, newLabel) {

			state.currentBoard.labels.push(newLabel)
		}
	},
	actions: {
		/**
		 * @param commit
		 * @param state
		 * @param {Board} board
		 */
		archiveBoard({ commit }, board) {
			const boardCopy = JSON.parse(JSON.stringify(board))
			boardCopy.archived = true
			apiClient.updateBoard(boardCopy)
				.then((board) => {
					commit('addBoard', board)
				})
		},
		/**
		 * Updates a board API side.
		 *
		 * @param commit
		 * @param board The board to update.
		 * @return {Promise<void>}
		 */
		async updateBoard({ commit }, board) {
			const storedBoard = await apiClient.updateBoard(board)
			commit('addBoard', storedBoard)
		},
		createBoard({ commit }, boardData) {
			apiClient.createBoard(boardData)
				.then((board) => {
					commit('addBoard', board)
				})
		},
		removeBoard({ commit }, board) {
			commit('removeBoard', board)
		},
		async loadBoards({ commit }) {
			const boards = await apiClient.loadBoards()
			commit('setBoards', boards)
		},
		loadSharees({ commit }) {
			const params = new URLSearchParams()
			params.append('format', 'json')
			params.append('perPage', 4)
			params.append('itemType', 0)
			params.append('itemType', 1)
			axios.get(OC.linkToOCS('apps/files_sharing/api/v1') + 'sharees', { params }).then((response) => {
				commit('setSharees', response.data.ocs.data.users)
			})
		},
		setBoardFilter({ commmit }, filter) {
			commmit('setBoardFilter', filter)
		},
		toggleNav({ commit }) {
			commit('toggleNav')
		},
		toggleSidebar({ commit }) {
			commit('toggleSidebar')
		},
		setCurrentBoard({ commit }, board) {
			commit('setCurrentBoard', board)
		},

		// label actions
		removeLabelFromCurrentBoard({ commit }, label) {
			apiClient.deleteLabel(label)
			.then((label) => {
				commit('removeLabelFromCurrentBoard', label.id);
			})
		},
		updateLabelFromCurrentBoard({ commit }, newLabel) {
			apiClient.updateLabel(newLabel)
			.then((newLabel) => {
				commit('updateLabelFromCurrentBoard', newLabel);
			})
		},
		addLabelToCurrentBoard({ commit }, newLabel) {
			newLabel.boardId = this.state.currentBoard.id
			apiClient.createLabel(newLabel)
			.then((newLabel) => {
				commit('addLabelToCurrentBoard', newLabel);
			})
		}
	}
})
