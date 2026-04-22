import { test, expect } from '@playwright/test'

test('미로그인 찜하기 → 로그인 모달 표시', async ({ page }) => {
  await page.goto('/')

  // 첫 번째 동물 카드로 상세 진입
  await page.locator('a[href^="/animals/"]').first().click()
  await expect(page).toHaveURL(/\/animals\//)

  // 찜하기 버튼 클릭
  await page.getByRole('button', { name: /찜하기/ }).click()

  // 로그인 모달 표시 확인
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText('찜하기는 로그인이 필요해요')).toBeVisible()
})
