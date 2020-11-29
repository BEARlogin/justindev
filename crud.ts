import { Action, Mutation, VuexModule } from 'vuex-module-decorators'
import { $axios } from '~/services/api'

export interface GetData<T> {
    data: T;
    lastPage: number;
    page: number;
    total: number;
}

export interface IQuery {
    where?: any;
    sort?: any;
    limit?: any;
    page?: number;
    populate?: any;
}

export interface IPagination {
    page: number,
    lastPage: number,
    total: number
}

export default class CrudStore<T, D> extends VuexModule {
    public entities: T[] = [];
    public entity: T | null = null;
    public pagination: IPagination = {
        page: 1,
        lastPage: 1,
        total: 1
    }

    get route () {
        return ''
    }

    get calculatedRoute () {
        return `/api/v1/${this.context.getters.route}/`
    }

    @Mutation
    SET_PAGINATION (payload: IPagination) {
        this.pagination = payload
    }

    @Mutation
    SET_ENTITIES (payload: T[]) {
        this.entities = payload
    }

    @Mutation
    SET_ENTITY (payload: T | null) {
        this.entity = payload
    }

    @Action(
        {
            rawError: true,
            commit: 'SET_ENTITIES'
        }
    )
    async fetch (payload: IQuery = {}) {
        const { data, lastPage, total, page } = (await $axios.$get<GetData<D[]>>(`${this.context.getters.calculatedRoute}`, {
            params: { query: JSON.stringify(payload) }
        }))
        this.context.commit('SET_PAGINATION', {
            lastPage,
            page,
            total
        })
        return data
    }

    @Action(
        {
            rawError: true,
            commit: 'SET_ENTITY'
        }
    )
    fetchById ({ id, query }: { id: string, query: IQuery }) {
        return $axios.$get<D>(`${this.context.getters.calculatedRoute}/${id}`, {
            params: { query: query ? JSON.stringify(query) : '{}' }
        })
    }

    @Action
    create (message: T) {
        return $axios.$post(`${this.context.getters.calculatedRoute}/`, message)
    }

    @Action
    update ({ entity, id }: {entity: Partial<D>, id: string}) {
        return $axios.$put(`${this.context.getters.calculatedRoute}/${id}`, entity)
    }

    @Action
    delete (id: string) {
        return $axios.$delete(`${this.context.getters.calculatedRoute}/${id}`)
    }
}
