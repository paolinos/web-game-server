package db

import "slices"

type Repository[T any] struct {
	data []T
}

func (r *Repository[T]) getBy(f func(T) bool) *T {
	pos := slices.IndexFunc(r.data, f)
	if pos == -1 {
		return nil
	}
	return &r.data[pos]
}

func (r *Repository[T]) add(t T) {
	r.data = append(r.data, t)
}

func (r *Repository[T]) delete(f func(T) bool) {

	pos := slices.IndexFunc(r.data, f)
	if pos == -1 {
		return
	}

	r.data = slices.Delete(r.data, pos, pos+1)
}
