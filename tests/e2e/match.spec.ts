import { test, expect } from '@playwright/test'

test('AI 매칭 설문 → 추천 결과 2초 이내', async ({ page }) => {
  await page.goto('/match')

  // 6단계 설문 순차 완료
  const selections = [
    '아파트',
    '없어요',
    '약 1시간',
    '혼자',
    '소형',
    '상관없음',
  ]

  for (const label of selections) {
    await page.getByRole('button', { name: new RegExp(label) }).click()
  }

  // 결과 페이지 확인 (2초 이내)
  const start = Date.now()
  await expect(page.getByText(/추천 결과/)).toBeVisible({ timeout: 2000 })
  const elapsed = Date.now() - start
  expect(elapsed).toBeLessThan(2000)

  // 카드 렌더링 확인 (결과가 있는 경우)
  // Note: empty state is also acceptable
  const hasCards = await page.locator('a[href^="/animals/"]').count()
  const hasEmpty = await page.getByText(/입양 가능한 동물이 없어요/).isVisible().catch(() => false)
  expect(hasCards > 0 || hasEmpty).toBe(true)
})
