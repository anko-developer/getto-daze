import { test, expect } from '@playwright/test'

test('검색 → 상세 흐름', async ({ page }) => {
  await page.goto('/')

  // 시/도 드롭다운 선택
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: '서울특별시' }).click()

  // 동물 카드 렌더링 대기 (최대 5초)
  await expect(page.locator('a[href^="/animals/"]').first()).toBeVisible({ timeout: 5000 })

  // 첫 번째 카드 클릭 → 상세 진입
  await page.locator('a[href^="/animals/"]').first().click()

  // 상세 정보 확인
  await expect(page).toHaveURL(/\/animals\//)
  await expect(page.getByRole('heading')).toBeVisible()
})
