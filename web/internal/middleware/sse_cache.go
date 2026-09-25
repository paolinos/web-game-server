package middleware

import "slices"

type SseData struct {
	UserId  string
	Message chan string
	Destroy bool
}

type SseCache struct {
	data []SseData
}

func (s *SseCache) Add(userId string) SseData {

	m := SseData{
		UserId:  userId,
		Message: make(chan string),
		Destroy: false,
	}
	s.data = append(s.data, m)
	return m
}
func (s *SseCache) GetBy(userId string) *SseData {
	pos := slices.IndexFunc(s.data, func(m SseData) bool { return m.UserId == userId })
	if pos == -1 {
		return nil
	}
	return &s.data[pos]
}
func (s *SseCache) Delete(userId string) {
	pos := slices.IndexFunc(s.data, func(m SseData) bool { return m.UserId == userId })
	if pos == -1 {
		return
	}
	slices.Delete(s.data, pos, pos+1)
}

var SseCacheData = SseCache{
	data: []SseData{},
}
