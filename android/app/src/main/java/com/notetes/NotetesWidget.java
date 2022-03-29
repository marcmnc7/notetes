package com.notetes;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.drawable.PictureDrawable;
import android.util.Base64;
import android.widget.RemoteViews;
import android.content.SharedPreferences;

import com.caverock.androidsvg.SVG;
import com.caverock.androidsvg.SVGParseException;

import org.json.JSONException;
import org.json.JSONObject;
/**
 * Implementation of App Widget functionality.
 */
public class NotetesWidget extends AppWidgetProvider {

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {

        try {

            Intent intent = new Intent(context, MainActivity.class);
            PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, 0);

            SharedPreferences sharedPref = context.getSharedPreferences("DATA", Context.MODE_PRIVATE);

            String appString = sharedPref.getString("appData", "R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=");
            JSONObject appData = new JSONObject(appString);

            byte[] decodedString = Base64.decode(appData.getString("svgInBase64"), Base64.DEFAULT);
            Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.notetes_widget);
            views.setOnClickPendingIntent(R.id.imageView3, pendingIntent);
            views.setImageViewBitmap(R.id.imageView3, decodedByte);
            appWidgetManager.updateAppWidget(appWidgetId, views);
        }catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {

        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }



    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }
}